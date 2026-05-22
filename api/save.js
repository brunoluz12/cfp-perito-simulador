const { Redis } = require('@upstash/redis');

// Vercel integration variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, data } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const key = `user:${username.toLowerCase().trim()}`;
    await redis.set(key, JSON.stringify(data));
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Redis Error:", error);
    return res.status(500).json({ error: 'Failed to save data' });
  }
};
