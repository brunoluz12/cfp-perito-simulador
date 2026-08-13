/*
 * Anexa as questões baixadas do SimuChacal (scraped_*.json) ao banco_questoes.js,
 * no conteúdo "SC" de cada disciplina. Regenera também banco_questoes.json.
 * Uso: node _reform/simuchacal/append_sc.js [--apply]
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const BANK = path.join(ROOT, 'banco_questoes.js');
const APPLY = process.argv.includes('--apply');
const LETTERS = ['A', 'B', 'C', 'D'];
// Lista apenas os simulados AINDA NAO importados: o script anexa mesmo o que
// ele proprio sinaliza como duplicata verbatim.
const FILES = ['scraped_15.json'];

function loadBank() {
  const s = fs.readFileSync(BANK, 'utf8');
  const tmp = path.join(__dirname, '__b.js');
  fs.writeFileSync(tmp, s.replace(/^const questoesDB =/, 'module.exports ='));
  const arr = require(tmp); fs.unlinkSync(tmp); return arr;
}

const bank = loadBank();
const existing = new Set(bank.map(q => (q.enunciado || '').trim()));
const disciplinas = new Set(bank.map(q => q.disciplina));
const maxId = Math.max(...bank.map(q => q.id));

const novas = [];
const errors = [];
let dupes = 0;
for (const f of FILES) {
  const qs = JSON.parse(fs.readFileSync(path.join(__dirname, f), 'utf8'));
  qs.forEach((q, i) => {
    const tag = `${f}#${i}`;
    const keys = Object.keys(q.alternativas || {});
    if (keys.length !== 4 || !LETTERS.every(l => keys.includes(l))) errors.push(`${tag}: alternativas != A-D`);
    if (!LETTERS.includes(q.resposta_correta)) errors.push(`${tag}: resposta_correta inválida`);
    if (!disciplinas.has(q.disciplina)) errors.push(`${tag}: disciplina desconhecida "${q.disciplina}"`);
    if (q.conteudo !== 'Simula Chacal') errors.push(`${tag}: conteudo != Simula Chacal`);
    if (!q.enunciado || !q.justificativa) errors.push(`${tag}: enunciado/justificativa vazios`);
    if (existing.has(q.enunciado.trim())) { dupes++; console.log(`${tag}: aviso - enunciado idêntico já existe no banco`); }
    novas.push(q);
  });
}
console.log('Novas:', novas.length, '| duplicatas verbatim:', dupes, '| ids', maxId + 1, 'a', maxId + novas.length);
if (errors.length) { errors.forEach(e => console.log('ERRO', e)); process.exit(1); }
if (!APPLY) { console.log('(dry-run) OK. Use --apply.'); process.exit(0); }

let id = maxId;
const objs = novas.map(q => ({
  id: ++id, disciplina: q.disciplina, conteudo: 'Simula Chacal', tipo: 'multipla_escolha',
  enunciado: q.enunciado, alternativas: q.alternativas, resposta_correta: q.resposta_correta,
  justificativa: q.justificativa, referencia: q.referencia,
}));
let src = fs.readFileSync(BANK, 'utf8');
const lb = src.lastIndexOf('];');
const before = src.slice(0, lb).replace(/\s*$/, '');
const after = src.slice(lb);
const block = objs.map(o => '  ' + JSON.stringify(o, null, 2).split('\n').join('\n  ')).join(',\n');
fs.writeFileSync(BANK, before + ',\n' + block + '\n' + after);
fs.writeFileSync(path.join(ROOT, 'banco_questoes.json'), JSON.stringify(bank.concat(objs), null, 2));
console.log('Anexado! ids', maxId + 1, 'a', id, '| banco_questoes.json regenerado.');
