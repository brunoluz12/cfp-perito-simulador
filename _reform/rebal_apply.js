// Reequilíbrio do vício "resposta correta = a mais longa" (padrão 4 alternativas A-D).
// Opera sobre o banco_questoes.js ATUAL (preservando LOC e tudo mais), aplicando por id
// os ajustes contidos em _reform/rebal/*.json. Idempotente.
// Uso: node _reform/rebal_apply.js [--apply]
const fs = require('fs');
const path = require('path');

const bankPath = path.join(__dirname, '..', 'banco_questoes.js');
let questoesDB;
eval(fs.readFileSync(bankPath, 'utf8').replace('const questoesDB', 'questoesDB'));

const rebalDir = path.join(__dirname, 'rebal');
const files = fs.existsSync(rebalDir) ? fs.readdirSync(rebalDir).filter(f => f.endsWith('.json')) : [];

const byId = new Map();
const errors = [];
for (const f of files) {
  let arr;
  try { arr = JSON.parse(fs.readFileSync(path.join(rebalDir, f), 'utf8')); }
  catch (e) { errors.push(`${f}: JSON inválido (${e.message})`); continue; }
  if (!Array.isArray(arr)) { errors.push(`${f}: não é array`); continue; }
  for (const r of arr) {
    if (byId.has(r.id)) errors.push(`id ${r.id}: duplicado em ${f}`);
    byId.set(r.id, r);
  }
}

const idIndex = new Map(questoesDB.map((q, i) => [q.id, i]));
let changed = 0;
const changedIds = [];
for (const [id, r] of byId) {
  const idx = idIndex.get(id);
  if (idx == null) { errors.push(`id ${id}: não encontrado no banco`); continue; }
  const orig = questoesDB[idx];
  const merged = { ...orig };
  if (r.enunciado != null) merged.enunciado = r.enunciado;
  if (r.alternativas != null) merged.alternativas = r.alternativas;
  if (r.resposta_correta != null) merged.resposta_correta = r.resposta_correta;
  if (r.justificativa != null) merged.justificativa = r.justificativa;
  if (r.referencia != null) merged.referencia = r.referencia;
  if (r.nivel != null) merged.nivel = r.nivel;
  // validações
  const keys = Object.keys(merged.alternativas || {});
  const ok4 = ['A', 'B', 'C', 'D'].every(k => keys.includes(k)) && keys.length === 4;
  if (!ok4) { errors.push(`id ${id}: alternativas devem ser exatamente A-D`); continue; }
  if (!['A', 'B', 'C', 'D'].includes(merged.resposta_correta)) { errors.push(`id ${id}: resposta_correta inválida`); continue; }
  if (!merged.alternativas[merged.resposta_correta]) { errors.push(`id ${id}: alternativa correta vazia`); continue; }
  questoesDB[idx] = merged;
  changed++; changedIds.push(id);
}

// Estatística "correta = mais longa" entre as questões alteradas
let longest = 0;
for (const id of changedIds) {
  const q = questoesDB[idIndex.get(id)];
  const lens = Object.values(q.alternativas).map(t => (t || '').length);
  if ((q.alternativas[q.resposta_correta] || '').length === Math.max(...lens)) longest++;
}

const report = {
  rebalFiles: files.length,
  alteradas: changed,
  corretaMaisLongaEntreAlteradas: changedIds.length ? Math.round(longest / changedIds.length * 100) + '%' : '—',
  totalBanco: questoesDB.length,
  errerrCount: errors.length,
  erros: errors.slice(0, 30)
};
console.log(JSON.stringify(report, null, 2));

const APPLY = process.argv.includes('--apply');
if (errors.length && APPLY) { console.error('\nABORTADO: corrija os erros antes de aplicar.'); process.exit(1); }
if (APPLY) {
  fs.writeFileSync(path.join(__dirname, '..', 'banco_questoes.json'), JSON.stringify(questoesDB, null, 2));
  fs.writeFileSync(bankPath, 'const questoesDB = ' + JSON.stringify(questoesDB, null, 2) + ';\n');
  console.log('\nAPLICADO: banco_questoes.js e banco_questoes.json regenerados.');
}
