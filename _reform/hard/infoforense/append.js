// Anexa as questões de Informática Forense ao banco_questoes.js
// Uso: node append.js         (dry-run)
//      node append.js --apply (grava)
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const BANK = path.join(ROOT, 'banco_questoes.js');
const SRC = path.join(__dirname, 'questions.json');
const DISCIPLINA = 'Informática Forense';

function loadBank() {
  let s = fs.readFileSync(BANK, 'utf8');
  s = s.replace(/const\s+questoesDB\s*=/, 'global.__DB=');
  eval(s);
  return global.__DB;
}

const bank = loadBank();
const novas = JSON.parse(fs.readFileSync(SRC, 'utf8'));

let maxId = 0;
for (const q of bank) if (q.id > maxId) maxId = q.id;

const letras = { A: 0, B: 0, C: 0, D: 0 };
const porCap = {};
const problemas = [];
const built = [];
let nextId = maxId + 1;

novas.forEach((q, i) => {
  const alts = q.alternativas;
  const keys = Object.keys(alts);
  if (keys.length !== 4 || !['A', 'B', 'C', 'D'].every(k => keys.includes(k)))
    problemas.push(`#${i + 1}: não tem exatamente A,B,C,D`);
  if (!['A', 'B', 'C', 'D'].includes(q.resposta_correta))
    problemas.push(`#${i + 1}: resposta_correta inválida (${q.resposta_correta})`);
  else letras[q.resposta_correta]++;
  if (!q.conteudo) problemas.push(`#${i + 1}: sem conteudo`);
  porCap[q.conteudo] = (porCap[q.conteudo] || 0) + 1;

  const lens = Object.entries(alts).map(([k, v]) => [k, (v || '').length]);
  const correta = lens.find(([k]) => k === q.resposta_correta)[1];
  const maiorOutra = Math.max(...lens.filter(([k]) => k !== q.resposta_correta).map(([, l]) => l));
  if (correta > maiorOutra * 1.10)
    problemas.push(`#${i + 1} (id ${nextId}, ${q.conteudo}): correta é a mais longa por margem >10% (${correta} vs ${maiorOutra})`);

  built.push({
    id: nextId++,
    disciplina: DISCIPLINA,
    conteudo: q.conteudo,
    tipo: 'multipla_escolha',
    enunciado: q.enunciado,
    alternativas: alts,
    resposta_correta: q.resposta_correta,
    justificativa: q.justificativa,
    referencia: q.referencia,
    nivel: q.nivel || 'dificil'
  });
});

console.log(`Banco atual: ${bank.length} (maxId ${maxId}). Novas: ${built.length} (ids ${maxId + 1}..${nextId - 1}).`);
console.log('Distribuição resposta:', letras);
console.log('Por capítulo:'); Object.keys(porCap).sort().forEach(c => console.log('  ' + porCap[c] + '  ' + c));
const niveis = built.reduce((a, q) => (a[q.nivel] = (a[q.nivel] || 0) + 1, a), {});
console.log('Níveis:', niveis);
if (problemas.length) { console.log('\nAVISOS:'); problemas.forEach(p => console.log('  - ' + p)); }
else console.log('\nSem problemas de validação.');

if (process.argv.includes('--apply')) {
  const out = bank.concat(built);
  fs.writeFileSync(BANK, 'const questoesDB = ' + JSON.stringify(out, null, 2) + ';\n', 'utf8');
  console.log(`\n>> GRAVADO: banco agora com ${out.length} questões.`);
} else {
  console.log('\n(dry-run) rode com --apply para gravar.');
}
