/*
 * Substitui questões por ID no banco_questoes.js (patch in-place, preservando o resto).
 * Cada arquivo de entrada é um array de objetos { id, alternativas, resposta_correta, justificativa, [enunciado], [referencia] }.
 * Uso: node _reform/hard/crim_plausivel/apply.js <arq1.json> [arq2.json ...] [--apply]
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const BANK = path.join(ROOT, 'banco_questoes.js');
const APPLY = process.argv.includes('--apply');
const FILES = process.argv.slice(2).filter(a => a !== '--apply');
const L = ['A', 'B', 'C', 'D'];

function loadBank() {
  const s = fs.readFileSync(BANK, 'utf8');
  const tmp = path.join(__dirname, '__b.js');
  fs.writeFileSync(tmp, s.replace(/^const questoesDB =/, 'module.exports ='));
  const arr = require(tmp); fs.unlinkSync(tmp); return arr;
}
const bank = loadBank();
const byId = new Map(bank.map((q, i) => [q.id, i]));

let rewrites = [];
for (const f of FILES) rewrites = rewrites.concat(JSON.parse(fs.readFileSync(path.resolve(ROOT, f), 'utf8')));

const errors = [], warnings = [];
let applied = 0;
const seenIds = new Set();
for (const r of rewrites) {
  const tag = `id ${r.id}`;
  if (!byId.has(r.id)) { errors.push(`${tag}: id inexistente no banco`); continue; }
  if (seenIds.has(r.id)) errors.push(`${tag}: id repetido no lote`);
  seenIds.add(r.id);
  const keys = Object.keys(r.alternativas || {});
  if (keys.length !== 4 || !L.every(l => keys.includes(l))) errors.push(`${tag}: alternativas != A-D`);
  if (!L.includes(r.resposta_correta)) errors.push(`${tag}: resposta_correta inválida`);
  if (!r.justificativa) warnings.push(`${tag}: sem justificativa (mantida a antiga)`);
  for (const l of L) { const t = (r.alternativas[l] || '').toLowerCase(); if (/(todas|nenhuma) das (alternativas|anteriores)|n\.d\.a/.test(t)) errors.push(`${tag}: "todas/nenhuma das anteriores"`); }
  const lens = L.map(l => (r.alternativas[l] || '').length).sort((a, b) => b - a);
  const cl = (r.alternativas[r.resposta_correta] || '').length;
  if (cl === lens[0] && lens[0] > lens[1] * 1.10) warnings.push(`${tag}: correta é a mais longa por margem (${cl} vs ${lens[1]})`);
}

console.log('Rewrites:', rewrites.length, '| erros:', errors.length, '| avisos:', warnings.length);
warnings.forEach(w => console.log('  aviso', w));
if (errors.length) { errors.forEach(e => console.log('  ERRO', e)); process.exit(1); }

if (!APPLY) { console.log('(dry-run) OK. Use --apply para gravar.'); process.exit(0); }

for (const r of rewrites) {
  const q = bank[byId.get(r.id)];
  if (r.enunciado) q.enunciado = r.enunciado;
  q.alternativas = r.alternativas;
  q.resposta_correta = r.resposta_correta;
  if (r.justificativa) q.justificativa = r.justificativa;
  if (r.referencia) q.referencia = r.referencia;
  applied++;
}
fs.writeFileSync(BANK, 'const questoesDB = ' + JSON.stringify(bank, null, 2) + ';\n');
console.log('Aplicado! Questões atualizadas:', applied);
