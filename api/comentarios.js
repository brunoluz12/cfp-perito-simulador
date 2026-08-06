const { Redis } = require('@upstash/redis');

// Comentários públicos por questão — todos os alunos leem e escrevem.
// Lista simples (sem resposta a comentário): cada envio vira um item novo.
// Guardado numa lista Redis qcom:<id>, do mais recente para o mais antigo.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

const ADMIN_USER = 'brunoluz12';
const MAX_TEXTO = 1500;       // por comentário
const MAX_POR_QUESTAO = 300;  // teto por questão (apara os mais antigos)

const chave = (qid) => `qcom:${qid}`;

// A lista pode ter itens já desserializados (SDK) ou strings JSON.
function parse(item) {
  if (item && typeof item === 'object') return item;
  try { return JSON.parse(item); } catch { return null; }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET ?id=123        → lista os comentários da questão
  // GET ?id=123&count=1 → só a quantidade (para o badge do botão)
  if (req.method === 'GET') {
    try {
      const qid = Number(req.query.id);
      if (Number.isNaN(qid)) return res.status(400).json({ error: 'id numérico é obrigatório' });

      if (req.query.count === '1') {
        const total = await redis.llen(chave(qid));
        return res.status(200).json({ id: qid, total: total || 0 });
      }

      const brutos = (await redis.lrange(chave(qid), 0, MAX_POR_QUESTAO - 1)) || [];
      const comentarios = brutos.map(parse).filter(Boolean);
      return res.status(200).json({ id: qid, comentarios, total: comentarios.length });
    } catch (error) {
      console.error('comentarios GET error:', error);
      // fail-safe: a questão continua utilizável mesmo se os comentários falharem
      return res.status(200).json({ id: Number(req.query.id) || null, comentarios: [], total: 0 });
    }
  }

  // POST { id, autor, texto } → publica um comentário
  if (req.method === 'POST') {
    try {
      const { id, autor, texto } = req.body || {};
      const qid = Number(id);
      const nome = String(autor || '').trim();
      const corpo = String(texto || '').trim();

      if (Number.isNaN(qid)) return res.status(400).json({ error: 'id numérico é obrigatório' });
      if (!nome) return res.status(400).json({ error: 'É preciso estar identificado para comentar' });
      if (!corpo) return res.status(400).json({ error: 'O comentário está vazio' });
      if (corpo.length > MAX_TEXTO) {
        return res.status(400).json({ error: `O comentário passa de ${MAX_TEXTO} caracteres` });
      }

      const comentario = {
        cid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        autor: nome,
        texto: corpo,
        ts: Date.now(),
      };

      const p = redis.pipeline();
      p.lpush(chave(qid), JSON.stringify(comentario));
      p.ltrim(chave(qid), 0, MAX_POR_QUESTAO - 1);
      await p.exec();

      return res.status(200).json({ success: true, comentario });
    } catch (error) {
      console.error('comentarios POST error:', error);
      return res.status(500).json({ error: 'Falha ao publicar o comentário' });
    }
  }

  // PUT { id, cid, autor, texto } → edita (SÓ o autor; nem o admin edita texto alheio)
  if (req.method === 'PUT') {
    try {
      const { id, cid, autor, texto } = req.body || {};
      const qid = Number(id);
      const quem = String(autor || '').trim();
      const corpo = String(texto || '').trim();

      if (Number.isNaN(qid) || !cid) return res.status(400).json({ error: 'id e cid são obrigatórios' });
      if (!corpo) return res.status(400).json({ error: 'O comentário está vazio' });
      if (corpo.length > MAX_TEXTO) {
        return res.status(400).json({ error: `O comentário passa de ${MAX_TEXTO} caracteres` });
      }

      const brutos = (await redis.lrange(chave(qid), 0, MAX_POR_QUESTAO - 1)) || [];
      const indice = brutos.findIndex((b) => {
        const c = parse(b);
        return c && c.cid === cid;
      });
      if (indice === -1) return res.status(404).json({ error: 'Comentário não encontrado' });

      const atual = parse(brutos[indice]);
      if (atual.autor !== quem) {
        return res.status(403).json({ error: 'Só o autor pode editar o próprio comentário' });
      }

      // Mantém cid e data original; marca que foi editado.
      const novo = { ...atual, texto: corpo, editadoEm: Date.now() };
      await redis.lset(chave(qid), indice, JSON.stringify(novo));
      return res.status(200).json({ success: true, comentario: novo });
    } catch (error) {
      console.error('comentarios PUT error:', error);
      return res.status(500).json({ error: 'Falha ao editar o comentário' });
    }
  }

  // DELETE { id, cid, autor } → apaga (só o autor do comentário ou o admin)
  if (req.method === 'DELETE') {
    try {
      const { id, cid, autor } = req.body || {};
      const qid = Number(id);
      const quem = String(autor || '').trim();
      if (Number.isNaN(qid) || !cid) {
        return res.status(400).json({ error: 'id e cid são obrigatórios' });
      }

      const brutos = (await redis.lrange(chave(qid), 0, MAX_POR_QUESTAO - 1)) || [];
      const alvoBruto = brutos.find((b) => {
        const c = parse(b);
        return c && c.cid === cid;
      });
      if (!alvoBruto) return res.status(404).json({ error: 'Comentário não encontrado' });

      const alvo = parse(alvoBruto);
      const ehDono = alvo.autor === quem;
      const ehAdmin = quem === ADMIN_USER;
      if (!ehDono && !ehAdmin) {
        return res.status(403).json({ error: 'Só o autor pode apagar o próprio comentário' });
      }

      // LREM pelo valor exato do item guardado na lista.
      const valor = typeof alvoBruto === 'string' ? alvoBruto : JSON.stringify(alvoBruto);
      await redis.lrem(chave(qid), 1, valor);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('comentarios DELETE error:', error);
      return res.status(500).json({ error: 'Falha ao apagar o comentário' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
