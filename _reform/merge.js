// Reconstrói o banco a partir do ORIGINAL + todas as saídas reformuladas em _reform/out/*.json
// Idempotente: pode rodar várias vezes conforme novas saídas chegam.
const fs = require('fs');
const path = require('path');

const original = JSON.parse(fs.readFileSync(path.join(__dirname, 'bank_original.json'), 'utf8'));
const outDir = path.join(__dirname, 'out');
const outFiles = fs.existsSync(outDir) ? fs.readdirSync(outDir).filter(f => f.endsWith('.json')) : [];

const NIVEIS = new Set(['facil', 'medio', 'dificil']);
const reformById = new Map();
const errors = [];

for (const f of outFiles) {
  let arr;
  try { arr = JSON.parse(fs.readFileSync(path.join(outDir, f), 'utf8')); }
  catch (e) { errors.push(`${f}: JSON inválido (${e.message})`); continue; }
  if (!Array.isArray(arr)) { errors.push(`${f}: não é array`); continue; }
  for (const q of arr) {
    const alts = q.alternativas || {};
    const keys = Object.keys(alts);
    const okKeys = ['A','B','C','D','E'].every(k => keys.includes(k)) && keys.length === 5;
    if (!okKeys) { errors.push(`id ${q.id} (${f}): alternativas devem ser exatamente A-E`); continue; }
    if (!['A','B','C','D','E'].includes(q.resposta_correta)) { errors.push(`id ${q.id}: resposta_correta inválida`); continue; }
    if (!alts[q.resposta_correta]) { errors.push(`id ${q.id}: alternativa correta vazia`); continue; }
    if (!q.nivel || !NIVEIS.has(q.nivel)) { errors.push(`id ${q.id}: nivel inválido (${q.nivel})`); continue; }
    if (!q.enunciado || q.enunciado.length < 15) { errors.push(`id ${q.id}: enunciado curto/vazio`); continue; }
    if (!q.justificativa || q.justificativa.length < 15) { errors.push(`id ${q.id}: justificativa curta/vazia`); continue; }
    reformById.set(q.id, q);
  }
}

// Reconstrói preservando id/disciplina/conteudo/tipo do original
let replaced = 0;
const merged = original.map(orig => {
  const r = reformById.get(orig.id);
  if (!r) return orig;
  replaced++;
  return {
    id: orig.id,
    disciplina: orig.disciplina,
    conteudo: orig.conteudo,
    tipo: orig.tipo || 'multipla_escolha',
    enunciado: r.enunciado,
    alternativas: { A: r.alternativas.A, B: r.alternativas.B, C: r.alternativas.C, D: r.alternativas.D, E: r.alternativas.E },
    resposta_correta: r.resposta_correta,
    justificativa: r.justificativa,
    referencia: r.referencia != null ? r.referencia : orig.referencia,
    nivel: r.nivel
  };
});

// ---- Validações agregadas ----
if (merged.length !== original.length) errors.push(`Contagem mudou: ${merged.length} vs ${original.length}`);

const APPLY = process.argv.includes('--apply');
const report = { outFiles: outFiles.length, replaced, errors: errors.slice(0, 50), errorCount: errors.length };

// Estatísticas só das reformuladas
const ref = merged.filter(q => reformById.has(q.id));
const nivByDisc = {}, longest = {}, posDist = {};
ref.forEach(q => {
  const d = q.disciplina;
  nivByDisc[d] = nivByDisc[d] || { facil:0, medio:0, dificil:0 };
  nivByDisc[d][q.nivel]++;
  const lens = Object.values(q.alternativas).map(t => (t||'').length);
  const maxLen = Math.max(...lens);
  longest[d] = longest[d] || { correctLongest:0, n:0 };
  longest[d].n++;
  if ((q.alternativas[q.resposta_correta]||'').length === maxLen) longest[d].correctLongest++;
  posDist[q.resposta_correta] = (posDist[q.resposta_correta]||0)+1;
});
report.nivelPorDisciplina = nivByDisc;
report.corretaMaisLonga = Object.fromEntries(Object.entries(longest).map(([d,v])=>[d, Math.round(v.correctLongest/v.n*100)+'%']));
report.posicaoCorreta = posDist;

console.log(JSON.stringify(report, null, 2));

if (errors.length && APPLY) { console.error('\nABORTADO: há erros de validação. Corrija antes de aplicar.'); process.exit(1); }

if (APPLY) {
  fs.writeFileSync(path.join(__dirname, '..', 'banco_questoes.json'), JSON.stringify(merged, null, 2));
  fs.writeFileSync(path.join(__dirname, '..', 'banco_questoes.js'), 'const questoesDB = ' + JSON.stringify(merged, null, 2) + ';\n');
  console.log('\nAPLICADO: banco_questoes.json e banco_questoes.js regenerados.');
}
