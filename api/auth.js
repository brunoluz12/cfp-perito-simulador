const { Redis } = require('@upstash/redis');
const crypto = require('crypto');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

const ADMIN_USER = 'brunoluz12';
const MIN_PASSWORD = 4;

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

    if (username.length < 2) {
      return res.status(400).json({ error: 'Username is required (min 2 chars)' });
    }

    const user = username.toLowerCase();
    const key = `access:${user}`;
    let record = lerRegistro(await redis.get(key));
    const agora = new Date().toISOString();

    // --- Cadastro: usuário novo escolhe a senha no primeiro acesso ---------
    if (!record) {
      if (token) return res.status(401).json({ status: 'invalid' }); // sessão de usuário apagado
      if (!password || password.length < MIN_PASSWORD) {
        return res.status(400).json({ status: 'weak', minLength: MIN_PASSWORD });
      }
      record = {
        status: user === ADMIN_USER ? 'approved' : 'pending',
        requestedAt: agora,
        lastAccessAt: agora
      };
      definirSenha(record, password);
      if (user === ADMIN_USER) record.approvedAt = agora;
      await redis.set(key, JSON.stringify(record));

      return res.status(200).json({
        status: record.status,
        isAdmin: user === ADMIN_USER,
        token: user === ADMIN_USER ? gerarToken(user, record) : undefined,
        novoCadastro: true
      });
    }

    // --- Usuário existente sem senha: define agora (1º acesso) -------------
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
