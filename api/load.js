const { Redis } = require('@upstash/redis');

// Vercel integration variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const key = `user:${username.toLowerCase().trim()}`;
    const dataStr = await redis.get(key);
    
    // Upstash already parses JSON automatically, but just in case it returns a string:
    let parsedData = dataStr;
    if (typeof dataStr === 'string') {
      try {
        parsedData = JSON.parse(dataStr);
      } catch(e) {}
    }

    return res.status(200).json({ data: parsedData || null });
  } catch (error) {
    console.error("Redis Error:", error);
    return res.status(500).json({ error: 'Failed to load data' });
  }
};
