const { Redis } = require('@upstash/redis');
const crypto = require('crypto');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

const ADMIN_USER = 'brunoluz12';
const AUTH_SECRET = process.env.AUTH_SECRET || 'cfp-perito-2026-simulador';

function lerRegistro(raw) {
  let data = raw;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch (e) { data = null; }
  }
  return data || null;
}

// O painel só abre com o token de sessão do admin (derivado da senha dele em
// /api/auth). Antes bastava mandar o nome no cabeçalho, o que qualquer pessoa
// conseguiria forjar para aprovar o próprio acesso.
async function ehAdmin(req) {
  const token = String(req.headers['x-admin-token'] || '').trim();
  if (!token) return false;
  const record = lerRegistro(await redis.get(`access:${ADMIN_USER}`));
  if (!record || !record.passHash) return false;
  const esperado = crypto.createHmac('sha256', AUTH_SECRET)
    .update(`${ADMIN_USER}:${record.passHash}`)
    .digest('hex');
  if (token.length !== esperado.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(esperado));
}

async function listarChaves(match) {
  let cursor = 0;
  let chaves = [];
  do {
    const result = await redis.scan(cursor, { match, count: 100 });
    cursor = result[0];
    chaves = chaves.concat(result[1]);
  } while (cursor !== 0 && cursor !== '0');
  return chaves;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin, X-Admin-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!(await ehAdmin(req))) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // GET ?comprovante=<usuario>: devolve o arquivo enviado no cadastro.
  // Fica fora da listagem porque sao centenas de KB por pessoa.
  if (req.method === 'GET' && req.query && req.query.comprovante) {
    try {
      const alvo = String(req.query.comprovante).toLowerCase().trim();
      const arquivo = await redis.get(`comprovante:${alvo}`);
      if (!arquivo) return res.status(404).json({ error: 'Comprovante não encontrado' });
      const dados = lerRegistro(await redis.get(`access:${alvo}`)) || {};
      return res.status(200).json({
        comprovante: String(arquivo),
        nome: dados.nome || null,
        email: dados.email || null,
        enviadoEm: dados.comprovanteEm || null
      });
    } catch (error) {
      console.error('Admin Comprovante Error:', error);
      return res.status(500).json({ error: 'Failed to load receipt' });
    }
  }

  // GET: listar todos os usuários
  if (req.method === 'GET') {
    try {
      const allAccessKeys = await listarChaves('access:*');

      const users = [];
      for (const key of allAccessKeys) {
        const username = key.replace('access:', '');
        if (username === ADMIN_USER) continue;

        const data = lerRegistro(await redis.get(key)) || {};
        const userData = lerRegistro(await redis.get(`user:${username}`));
        const userStats = userData?.stats || null;

        users.push({
          username,
          nome: data.nome || null,
          email: data.email || null,
          status: data.status || 'pending',
          temSenha: !!data.passHash,
          temComprovante: !!data.comprovanteEm,
          comprovanteEm: data.comprovanteEm || null,
          requestedAt: data.requestedAt || null,
          approvedAt: data.approvedAt || null,
          lastAccessAt: data.lastAccessAt || null,
          stats: userStats ? {
            totalResolvidas: userStats.totalResolvidas || 0,
            totalAcertos: userStats.totalAcertos || 0,
            totalErros: userStats.totalErros || 0
          } : null
        });
      }

      // Ordenar: pendentes primeiro, depois por data
      users.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return (a.requestedAt || '').localeCompare(b.requestedAt || '');
      });

      return res.status(200).json({ users });
    } catch (error) {
      console.error('Admin List Error:', error);
      return res.status(500).json({ error: 'Failed to list users' });
    }
  }

  // POST: alterar status / senha / apagar usuários
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const { username, action } = body;

      // Salva as configurações editadas na aba Configurações do painel.
      if (action === 'saveConfig') {
        const entrada = body.config || {};
        const limpar = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
        const config = {
          pixChave: limpar(entrada.pixChave, 120),
          pixValor: limpar(entrada.pixValor, 40),
          pixTitular: limpar(entrada.pixTitular, 80),
          avisoCadastro: limpar(entrada.avisoCadastro, 300)
        };
        await redis.set('config:app', JSON.stringify(config));
        return res.status(200).json({ success: true, config });
      }

      // Zera a base de usuários (mantém somente o admin) — usado na virada do
      // app de uso pessoal para uso comercial.
      if (action === 'wipe') {
        if (String(body.confirm) !== 'ZERAR') {
          return res.status(400).json({ error: 'confirm: "ZERAR" required' });
        }
        const chaves = [
          ...(await listarChaves('access:*')),
          ...(await listarChaves('user:*')),
          ...(await listarChaves('comprovante:*'))
        ];
        let apagados = 0;
        for (const key of chaves) {
          const nome = key.replace(/^(access|user|comprovante):/, '');
          if (nome === ADMIN_USER) continue;
          await redis.del(key);
          apagados++;
        }
        return res.status(200).json({ success: true, apagados });
      }

      // Exclusão em lote: o painel manda a lista de selecionados de uma vez.
      if (action === 'deleteMany') {
        const lista = Array.isArray(body.usernames) ? body.usernames : [];
        if (lista.length === 0) {
          return res.status(400).json({ error: 'usernames (array) required' });
        }
        const apagados = [];
        for (const nome of lista) {
          const alvo = String(nome).toLowerCase().trim();
          if (!alvo || alvo === ADMIN_USER) continue; // o admin nunca é apagado
          await redis.del(`access:${alvo}`);
          await redis.del(`user:${alvo}`);
          await redis.del(`comprovante:${alvo}`);
          apagados.push(alvo);
        }
        return res.status(200).json({ success: true, apagados: apagados.length, usuarios: apagados });
      }

      if (!username || !['approve', 'block', 'resetPassword', 'delete'].includes(action)) {
        return res.status(400).json({ error: 'username and a valid action are required' });
      }

      const user = String(username).toLowerCase().trim();
      if (user === ADMIN_USER) {
        return res.status(400).json({ error: 'O administrador não pode ser alterado por aqui.' });
      }

      const key = `access:${user}`;

      if (action === 'delete') {
        await redis.del(key);
        await redis.del(`user:${user}`);
        await redis.del(`comprovante:${user}`);
        return res.status(200).json({ success: true, deleted: true });
      }

      const existing = lerRegistro(await redis.get(key)) || {};

      if (action === 'approve') {
        existing.status = 'approved';
        existing.approvedAt = new Date().toISOString();
      } else if (action === 'block') {
        existing.status = 'blocked';
        existing.approvedAt = null;
      } else if (action === 'resetPassword') {
        // Apaga a senha: o usuário escolhe uma nova no próximo acesso e as
        // sessões salvas nos aparelhos dele deixam de valer.
        delete existing.passHash;
        delete existing.passSalt;
        delete existing.passwordSetAt;
      }

      await redis.set(key, JSON.stringify(existing));
      return res.status(200).json({ success: true, status: existing.status });
    } catch (error) {
      console.error('Admin Update Error:', error);
      return res.status(500).json({ error: 'Failed to update user' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
