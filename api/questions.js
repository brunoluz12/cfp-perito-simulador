const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

const ADMIN_USER = 'brunoluz12';
const KEY = 'deleted_questions';

async function lerExcluidas() {
  let raw = await redis.get(KEY);
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw); } catch (e) { raw = []; }
  }
  if (!Array.isArray(raw)) raw = [];
  // normaliza para números únicos
  return [...new Set(raw.map(Number).filter(n => !Number.isNaN(n)))];
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET: lista pública de IDs excluídos (todos os clientes filtram a base)
  if (req.method === 'GET') {
    try {
      const deleted = await lerExcluidas();
      return res.status(200).json({ deleted });
    } catch (error) {
      console.error('questions GET error:', error);
      return res.status(200).json({ deleted: [] }); // fail-safe: não quebra o app
    }
  }

  // POST: somente admin — adiciona/remove um ID da lista de excluídas
  if (req.method === 'POST') {
    const adminHeader = (req.headers['x-admin'] || '').toLowerCase().trim();
    if (adminHeader !== ADMIN_USER) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const { action, id } = req.body || {};
      const qid = Number(id);
      if (!['delete', 'restore'].includes(action) || Number.isNaN(qid)) {
        return res.status(400).json({ error: 'action (delete|restore) e id numérico são obrigatórios' });
      }
      let deleted = await lerExcluidas();
      if (action === 'delete') {
        if (!deleted.includes(qid)) deleted.push(qid);
      } else {
        deleted = deleted.filter(x => x !== qid);
      }
      await redis.set(KEY, JSON.stringify(deleted));
      return res.status(200).json({ success: true, count: deleted.length, deleted });
    } catch (error) {
      console.error('questions POST error:', error);
      return res.status(500).json({ error: 'Falha ao atualizar a lista de questões excluídas' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
