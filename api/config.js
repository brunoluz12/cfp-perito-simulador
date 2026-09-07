const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

// Configurações que o administrador edita no painel. São PÚBLICAS: a tela de
// cadastro precisa delas antes de qualquer login. Nunca colocar segredo aqui.
const CONFIG_KEY = 'config:app';

const PADRAO = {
  pixChave: '',
  pixValor: '',
  pixTitular: '',
  avisoCadastro: ''
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  // A tela de cadastro busca isto a cada abertura; meio minuto de cache já
  // evita a maior parte das idas ao banco sem atrasar uma troca de chave.
  res.setHeader('Cache-Control', 'public, max-age=30');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let dados = await redis.get(CONFIG_KEY);
    if (typeof dados === 'string') {
      try { dados = JSON.parse(dados); } catch (e) { dados = null; }
    }
    return res.status(200).json({ config: Object.assign({}, PADRAO, dados || {}) });
  } catch (error) {
    console.error('Config Error:', error);
    // Sem banco, o app cai no valor embutido no código — melhor que travar.
    return res.status(200).json({ config: PADRAO });
  }
};

module.exports.CONFIG_KEY = CONFIG_KEY;
module.exports.PADRAO = PADRAO;
