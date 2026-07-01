/*
 * Anexa um arquivo JSON de questões extras (já com resposta_correta definida)
 * ao banco_questoes.js, com validação e dedupe por enunciado.
 * Uso: node _reform/hard/crim_extremo/append_extra.js <arquivo.json> [--apply]
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const BANK = path.join(ROOT, 'banco_questoes.js');
const FILE = process.argv[2];
const APPLY = process.argv.includes('--apply');
const LETTERS = ['A', 'B', 'C', 'D'];
const DISCIPLINA = 'Criminalística';

function loadBank() {
  const s = fs.readFileSync(BANK, 'utf8');
  const tmp = path.join(__dirname, '__b.js');
  fs.writeFileSync(tmp, s.replace(/^const questoesDB =/, 'module.exports ='));
  const arr = require(tmp); fs.unlinkSync(tmp); return arr;
}
const bank = loadBank();
const existing = new Set(bank.map(q => (q.enunciado || '').trim()));
const maxId = Math.max(...bank.map(q => q.id));
const novas = JSON.parse(fs.readFileSync(path.resolve(ROOT, FILE), 'utf8'));

const errors = [];
novas.forEach((q, i) => {
  const tag = `#${i}`;
  const keys = Object.keys(q.alternativas || {});
  if (keys.length !== 4 || !LETTERS.every(l => keys.includes(l))) errors.push(`${tag}: alternativas != A-D`);
  if (!LETTERS.includes(q.resposta_correta)) errors.push(`${tag}: resposta_correta inválida`);
  if (existing.has((q.enunciado || '').trim())) errors.push(`${tag}: enunciado já existe no banco`);
  const lens = LETTERS.map(l => (q.alternativas[l] || '').length).sort((a, b) => b - a);
  const cl = (q.alternativas[q.resposta_correta] || '').length;
  if (cl === lens[0] && lens[0] > lens[1] * 1.10) errors.push(`${tag}: correta é a mais longa por margem`);
  if (cl === lens[0]) console.log(`${tag}: aviso - correta é a mais longa (${cl} vs ${lens[1]})`);
});
console.log('Extras:', novas.length, '| novos ids', maxId + 1, 'a', maxId + novas.length);
if (errors.length) { errors.forEach(e => console.log('ERRO', e)); process.exit(1); }
if (!APPLY) { console.log('(dry-run) OK. Use --apply.'); process.exit(0); }

let id = maxId;
const objs = novas.map(q => ({ id: ++id, disciplina: DISCIPLINA, conteudo: q.conteudo, tipo: 'multipla_escolha', enunciado: q.enunciado, alternativas: q.alternativas, resposta_correta: q.resposta_correta, justificativa: q.justificativa, referencia: q.referencia, nivel: q.nivel }));
let src = fs.readFileSync(BANK, 'utf8');
const lb = src.lastIndexOf('];');
const before = src.slice(0, lb).replace(/\s*$/, '');
const after = src.slice(lb);
const block = objs.map(o => '  ' + JSON.stringify(o, null, 2).split('\n').join('\n  ')).join(',\n');
fs.writeFileSync(BANK, before + ',\n' + block + '\n' + after);
console.log('Anexado! ids', maxId + 1, 'a', id);
