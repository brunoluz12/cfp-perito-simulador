const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

const ADMIN_USER = 'brunoluz12';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Verificar se é admin
  const adminHeader = (req.headers['x-admin'] || '').toLowerCase().trim();
  if (adminHeader !== ADMIN_USER) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // GET: listar todos os usuários
  if (req.method === 'GET') {
    try {
      // Buscar todas as chaves access:*
      let cursor = 0;
      let allAccessKeys = [];
      
      do {
        const result = await redis.scan(cursor, { match: 'access:*', count: 100 });
        cursor = result[0];
        allAccessKeys = allAccessKeys.concat(result[1]);
      } while (cursor !== 0 && cursor !== '0');

      // Também buscar chaves user:* (usuários pré-existentes)
      let cursor2 = 0;
      let allUserKeys = [];
      
      do {
        const result = await redis.scan(cursor2, { match: 'user:*', count: 100 });
        cursor2 = result[0];
        allUserKeys = allUserKeys.concat(result[1]);
      } while (cursor2 !== 0 && cursor2 !== '0');

      // Extrair usernames das chaves access:*
      const accessUsernames = new Set(allAccessKeys.map(k => k.replace('access:', '')));

      // Para cada user:* que NÃO tem access:*, criar registro aprovado automaticamente
      for (const userKey of allUserKeys) {
        const username = userKey.replace('user:', '');
        if (username === ADMIN_USER) continue;
        if (!accessUsernames.has(username)) {
          const autoRecord = {
            status: 'approved',
            requestedAt: new Date().toISOString(),
            approvedAt: new Date().toISOString()
          };
          await redis.set(`access:${username}`, JSON.stringify(autoRecord));
          allAccessKeys.push(`access:${username}`);
        }
      }

      const users = [];
      for (const key of allAccessKeys) {
        const username = key.replace('access:', '');
        if (username === ADMIN_USER) continue; // Não mostra o admin na lista
        
        let data = await redis.get(key);
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch(e) { data = {}; }
        }

        users.push({
          username,
          status: data?.status || 'pending',
          requestedAt: data?.requestedAt || null,
          approvedAt: data?.approvedAt || null
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
      console.error("Admin List Error:", error);
      return res.status(500).json({ error: 'Failed to list users' });
    }
  }

  // POST: alterar status de um usuário
  if (req.method === 'POST') {
    try {
      const { username, action } = req.body;

      if (!username || !['approve', 'block'].includes(action)) {
        return res.status(400).json({ error: 'username and action (approve|block) required' });
      }

      const user = username.toLowerCase().trim();
      const key = `access:${user}`;
      
      let existing = await redis.get(key);
      if (typeof existing === 'string') {
        try { existing = JSON.parse(existing); } catch(e) { existing = {}; }
      }
      existing = existing || {};

      if (action === 'approve') {
        existing.status = 'approved';
        existing.approvedAt = new Date().toISOString();
      } else if (action === 'block') {
        existing.status = 'blocked';
        existing.approvedAt = null;
      }

      await redis.set(key, JSON.stringify(existing));
      return res.status(200).json({ success: true, status: existing.status });
    } catch (error) {
      console.error("Admin Update Error:", error);
      return res.status(500).json({ error: 'Failed to update user' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
