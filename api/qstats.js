const { Redis } = require('@upstash/redis');

// Estatísticas agregadas (anônimas) por questão: distribuição de respostas e
// taxa de acerto, contando CADA resolução (cada resposta dada por qualquer aluno).
// Guardado num hash Redis qstats:<id> com os campos A,B,C,D,total,acertos.
// Não armazena quem respondeu — apenas contadores.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

const LETRAS = ['A', 'B', 'C', 'D'];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET: estatísticas agregadas de uma questão
  if (req.method === 'GET') {
    try {
      const qid = Number(req.query.id);
      if (Number.isNaN(qid)) {
        return res.status(400).json({ error: 'id numérico é obrigatório' });
      }
      const h = (await redis.hgetall(`qstats:${qid}`)) || {};
      const num = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      };
      return res.status(200).json({
        id: qid,
        A: num(h.A), B: num(h.B), C: num(h.C), D: num(h.D),
        total: num(h.total),
        acertos: num(h.acertos),
      });
    } catch (error) {
      console.error('qstats GET error:', error);
      // fail-safe: não quebra o app, devolve zeros
      return res.status(200).json({ id: Number(req.query.id) || null, A: 0, B: 0, C: 0, D: 0, total: 0, acertos: 0 });
    }
  }

  // POST: registra uma resolução { id, letra, acerto }
  if (req.method === 'POST') {
    try {
      const { id, letra, acerto } = req.body || {};
      const qid = Number(id);
      const L = String(letra || '').toUpperCase();
      if (Number.isNaN(qid) || !LETRAS.includes(L)) {
        return res.status(400).json({ error: 'id numérico e letra (A-D) são obrigatórios' });
      }
      const key = `qstats:${qid}`;
      const p = redis.pipeline();
      p.hincrby(key, L, 1);
      p.hincrby(key, 'total', 1);
      if (acerto === true) p.hincrby(key, 'acertos', 1);
      await p.exec();
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('qstats POST error:', error);
      return res.status(500).json({ error: 'Falha ao registrar a resolução' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
