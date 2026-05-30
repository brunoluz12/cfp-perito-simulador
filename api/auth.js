const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

const ADMIN_USER = 'brunoluz12';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { username } = req.query;

    if (!username || username.trim().length < 2) {
      return res.status(400).json({ error: 'Username is required (min 2 chars)' });
    }

    const user = username.toLowerCase().trim();

    // Admin sempre aprovado
    if (user === ADMIN_USER) {
      return res.status(200).json({ status: 'approved', isAdmin: true });
    }

    const key = `access:${user}`;
    const existing = await redis.get(key);

    if (existing) {
      // Já existe registro
      let data = existing;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch(e) {}
      }
      return res.status(200).json({ status: data.status || 'pending' });
    } else {
      // Novo usuário: criar registro pendente
      const newRecord = {
        status: 'pending',
        requestedAt: new Date().toISOString()
      };
      await redis.set(key, JSON.stringify(newRecord));
      return res.status(200).json({ status: 'pending' });
    }
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(500).json({ error: 'Failed to check access' });
  }
};
