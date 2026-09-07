const { Redis } = require('@upstash/redis');
const crypto = require('crypto');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

const ADMIN_USER = 'brunoluz12';
const MIN_PASSWORD = 4;
// O nome de usuário é escolhido livremente por quem se cadastra e depois é
// exibido no painel do admin: aceitar só letras, números, espaço, ponto,
// hífen e sublinhado evita nome com HTML/script dentro.
const USERNAME_OK = /^[\p{L}\p{N} ._-]{2,30}$/u;
// Nome completo: pelo menos duas palavras, só letras e sinais de nome.
const NOME_OK = /^[\p{L}][\p{L}'.\-]*(?:\s+[\p{L}'.\-]+)+$/u;
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Comprovante: imagem (o app já reduz antes de enviar) ou PDF, em data URL.
const COMPROVANTE_OK = /^data:(image\/(png|jpe?g|webp)|application\/pdf);base64,[A-Za-z0-9+/=]+$/;
const COMPROVANTE_MAX = 700000; // ~700 KB de data URL, dentro do limite da API

// Segredo usado para derivar o token de "manter conectado". Trocar o valor
// (variável AUTH_SECRET na Vercel) desconecta todo mundo de uma vez.
const AUTH_SECRET = process.env.AUTH_SECRET || 'cfp-perito-2026-simulador';

// --- Senha -----------------------------------------------------------------
// scrypt com salt por usuário: nunca guardamos a senha em texto puro.
function hashPassword(password, salt) {
  return crypto.scryptSync(String(password), salt, 32).toString('hex');
}

function senhaConfere(record, password) {
  if (!record || !record.passHash || !record.passSalt) return false;
  const calc = Buffer.from(hashPassword(password, record.passSalt), 'hex');
  const saved = Buffer.from(record.passHash, 'hex');
  if (calc.length !== saved.length) return false;
  return crypto.timingSafeEqual(calc, saved);
}

function definirSenha(record, password) {
  record.passSalt = crypto.randomBytes(16).toString('hex');
  record.passHash = hashPassword(password, record.passSalt);
  record.passwordSetAt = new Date().toISOString();
  return record;
}

// --- Token de sessão -------------------------------------------------------
// Derivado (não sorteado) do hash da senha: continua válido em vários aparelhos
// ao mesmo tempo e deixa de valer sozinho quando a senha é trocada/resetada.
function gerarToken(user, record) {
  return crypto.createHmac('sha256', AUTH_SECRET)
    .update(`${user}:${record.passHash || ''}`)
    .digest('hex');
}

// Confere os campos do cadastro. Devolve a mensagem do primeiro problema
// encontrado, ou null se estiver tudo certo.
function problemaNoCadastro({ nome, email, comprovante }) {
  if (!nome || !NOME_OK.test(nome) || nome.length < 5 || nome.length > 80) return 'badNome';
  if (!email || !EMAIL_OK.test(email) || email.length > 120) return 'badEmail';
  if (!comprovante) return 'semComprovante';
  if (!COMPROVANTE_OK.test(comprovante)) return 'badComprovante';
  if (comprovante.length > COMPROVANTE_MAX) return 'comprovanteGrande';
  return null;
}

function lerRegistro(raw) {
  let data = raw;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch (e) { data = null; }
  }
  return data || null;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET: apenas "ping" de último acesso de quem já está logado. Não autentica
  // ninguém e não cria registro — o login é sempre pelo POST, com senha.
  if (req.method === 'GET') {
    try {
      const user = String(req.query.username || '').toLowerCase().trim();
      if (!user) return res.status(400).json({ error: 'Username is required' });

      const key = `access:${user}`;
      const data = lerRegistro(await redis.get(key));
      if (data) {
        data.lastAccessAt = new Date().toISOString();
        await redis.set(key, JSON.stringify(data));
      }
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Auth Ping Error:', error);
      return res.status(500).json({ error: 'Failed to ping access' });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const username = String(body.username || '').trim();
    const password = body.password != null ? String(body.password) : null;
    const token = body.token ? String(body.token) : null;
    const acao = String(body.action || 'login');
    const nome = String(body.nome || '').replace(/\s+/g, ' ').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const comprovante = body.comprovante ? String(body.comprovante) : null;

    if (username.length < 2) {
      return res.status(400).json({ error: 'Username is required (min 2 chars)' });
    }
    if (!USERNAME_OK.test(username)) {
      return res.status(400).json({ status: 'badUsername' });
    }

    const user = username.toLowerCase();
    const key = `access:${user}`;
    let record = lerRegistro(await redis.get(key));
    const agora = new Date().toISOString();

    // --- CADASTRO ----------------------------------------------------------
    // Nome completo, e-mail e comprovante do Pix ficam guardados para o
    // administrador conferir antes de liberar o acesso.
    if (acao === 'register') {
      if (record) return res.status(409).json({ status: 'exists' });
      if (!password || password.length < MIN_PASSWORD) {
        return res.status(400).json({ status: 'weak', minLength: MIN_PASSWORD });
      }
      const problema = problemaNoCadastro({ nome, email, comprovante });
      if (problema) return res.status(400).json({ status: problema });

      record = {
        status: user === ADMIN_USER ? 'approved' : 'pending',
        nome,
        email,
        requestedAt: agora,
        lastAccessAt: agora,
        comprovanteEm: agora
      };
      definirSenha(record, password);
      if (user === ADMIN_USER) record.approvedAt = agora;

      await redis.set(`comprovante:${user}`, comprovante);
      await redis.set(key, JSON.stringify(record));

      return res.status(200).json({
        status: record.status,
        isAdmin: user === ADMIN_USER,
        token: user === ADMIN_USER ? gerarToken(user, record) : undefined,
        novoCadastro: true
      });
    }

    // --- REENVIO DE COMPROVANTE -------------------------------------------
    // Para quem mandou o arquivo errado: exige a senha, então só o dono troca.
    if (acao === 'comprovante') {
      if (!record || !record.passHash || !senhaConfere(record, password)) {
        return res.status(401).json({ status: 'invalid' });
      }
      if (!comprovante || !COMPROVANTE_OK.test(comprovante)) {
        return res.status(400).json({ status: 'badComprovante' });
      }
      if (comprovante.length > COMPROVANTE_MAX) {
        return res.status(400).json({ status: 'comprovanteGrande' });
      }
      await redis.set(`comprovante:${user}`, comprovante);
      record.comprovanteEm = agora;
      await redis.set(key, JSON.stringify(record));
      return res.status(200).json({ ok: true, status: record.status || 'pending' });
    }

    // --- LOGIN -------------------------------------------------------------
    // Sem registro não há login: a entrada agora é sempre pela tela de
    // cadastro (antes, digitar um nome novo criava a conta na hora).
    if (!record) {
      if (token) {
        return res.status(401).json({ status: 'invalid' }); // sessão de usuário apagado
      }
      return res.status(404).json({ status: 'notFound' });
    }

    // --- Usuário antigo, ainda sem senha: define agora ----------------------
    if (!record.passHash) {
      if (token) return res.status(401).json({ status: 'invalid' });
      if (!password || password.length < MIN_PASSWORD) {
        return res.status(400).json({ status: 'weak', minLength: MIN_PASSWORD, precisaDefinirSenha: true });
      }
      definirSenha(record, password);
    } else if (token) {
      // --- Sessão salva no aparelho ---------------------------------------
      if (token !== gerarToken(user, record)) {
        return res.status(401).json({ status: 'invalid' });
      }
    } else {
      // --- Login normal ----------------------------------------------------
      if (!password || !senhaConfere(record, password)) {
        return res.status(401).json({ status: 'invalid' });
      }
    }

    // O admin nunca fica pendente/bloqueado.
    if (user === ADMIN_USER) record.status = 'approved';

    record.lastAccessAt = agora;
    await redis.set(key, JSON.stringify(record));

    const status = record.status || 'pending';
    if (status !== 'approved') {
      return res.status(200).json({ status });
    }

    return res.status(200).json({
      status: 'approved',
      isAdmin: user === ADMIN_USER,
      token: gerarToken(user, record)
    });
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(500).json({ error: 'Failed to check access' });
  }
};
