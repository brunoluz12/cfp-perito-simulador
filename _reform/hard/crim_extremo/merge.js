/*
 * Valida, rebalanceia a letra correta (A-D) e (com --apply) mescla as questões
 * extremas de Criminalística no banco_questoes.js.
 * Uso: node _reform/hard/crim_extremo/merge.js [--apply]
 *
 * As justificativas referem-se ao CONTEÚDO das alternativas (não à letra),
 * por isso é seguro reposicionar a alternativa correta para balancear A/B/C/D.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const BANK = path.join(ROOT, 'banco_questoes.js');
const DIR = __dirname;
const APPLY = process.argv.includes('--apply');

const DISCIPLINA = 'Criminalística';
const LETTERS = ['A', 'B', 'C', 'D'];

function loadBank() {
  const s = fs.readFileSync(BANK, 'utf8');
  const tmp = path.join(DIR, '__bank_tmp.js');
  fs.writeFileSync(tmp, s.replace(/^const questoesDB =/, 'module.exports ='));
  const arr = require(tmp);
  fs.unlinkSync(tmp);
  return arr;
}

const bank = loadBank();
const existingEnun = new Set(bank.map(q => (q.enunciado || '').trim()));
const maxId = Math.max(...bank.map(q => q.id));

let novas = [];
for (let i = 1; i <= 17; i++) {
  const f = path.join(DIR, 'cap' + String(i).padStart(2, '0') + '.json');
  if (!fs.existsSync(f)) { console.log('FALTA arquivo:', f); continue; }
  const arr = JSON.parse(fs.readFileSync(f, 'utf8'));
  arr.forEach(q => q.__cap = i);
  novas = novas.concat(arr);
}

// --- Rebalanceia a letra correta em ciclo A,B,C,D ---
function rebalance(qs) {
  qs.forEach((q, idx) => {
    const target = LETTERS[idx % 4];
    const cur = q.resposta_correta;
    if (cur === target) return;
    const tmp = q.alternativas[target];
    q.alternativas[target] = q.alternativas[cur];
    q.alternativas[cur] = tmp;
    q.resposta_correta = target;
  });
}
rebalance(novas);

// --- Aparo automático: evita que a correta seja a mais longa ---
// Remove a última cláusula (separada por "; ") da alternativa correta enquanto
// ela for mais longa que o maior distrator. As cláusulas removidas são apenas
// fatos verdadeiros adicionais; a explicação integral permanece na justificativa.
function trimCorrect(qs) {
  let trimmed = 0;
  qs.forEach(q => {
    const corr = q.resposta_correta;
    const others = LETTERS.filter(l => l !== corr).map(l => (q.alternativas[l] || '').length).sort((a, b) => a - b);
    const minD = others[0], maxD = others[2];
    let t = (q.alternativas[corr] || '').trim();
    let changed = false;
    while (t.length > maxD && t.includes('; ')) {
      const parts = t.split('; ');
      let cand = parts.slice(0, -1).join('; ');
      if (!/[.!?]$/.test(cand)) cand += '.';
      if (cand.length < minD) break; // não deixar a correta virar a mais curta
      t = cand;
      changed = true;
    }
    if (changed) { q.alternativas[corr] = t; trimmed++; }
  });
  return trimmed;
}
// (aparo automático desativado — equilíbrio feito alongando distratores nas questões marcadas)
void trimCorrect;

// --- Validação ---
const errors = [];
const warnings = [];
const letterCount = { A: 0, B: 0, C: 0, D: 0 };
let correctLongestByMargin = 0;
let correctStrictLongest = 0;
const seenEnun = new Set();

novas.forEach((q) => {
  const tag = `cap${q.__cap}: "${(q.enunciado || '').slice(0, 40)}..."`;
  if (!q.conteudo) errors.push(`${tag}: sem conteudo`);
  if (!q.enunciado) errors.push(`${tag}: sem enunciado`);
  if (!q.alternativas) { errors.push(`${tag}: sem alternativas`); return; }
  const keys = Object.keys(q.alternativas);
  if (keys.length !== 4 || !LETTERS.every(l => keys.includes(l))) errors.push(`${tag}: alternativas != A-D`);
  if (!LETTERS.includes(q.resposta_correta)) errors.push(`${tag}: resposta_correta inválida`);
  if (!q.justificativa) errors.push(`${tag}: sem justificativa`);
  if (!q.referencia) errors.push(`${tag}: sem referencia`);
  if (q.nivel !== 'dificil') warnings.push(`${tag}: nivel != dificil`);
  for (const l of LETTERS) {
    const t = (q.alternativas[l] || '').toLowerCase();
    if (/(todas|nenhuma) das (alternativas|anteriores)|n\.d\.a/.test(t)) errors.push(`${tag}: usa "todas/nenhuma das anteriores"`);
  }
  if (LETTERS.includes(q.resposta_correta)) letterCount[q.resposta_correta]++;
  // correta é a mais longa por margem (>10% acima da 2ª maior)?
  const lens = LETTERS.map(l => (q.alternativas[l] || '').length).sort((a, b) => b - a);
  const correctLen = (q.alternativas[q.resposta_correta] || '').length;
  if (correctLen === lens[0]) correctStrictLongest++;
  if (correctLen === lens[0] && lens[0] > lens[1] * 1.10) {
    correctLongestByMargin++;
    warnings.push(`${tag}: correta é a mais longa por margem (${correctLen} vs ${lens[1]})`);
  }
  const e = (q.enunciado || '').trim();
  if (existingEnun.has(e)) errors.push(`${tag}: enunciado já existe no banco`);
  if (seenEnun.has(e)) errors.push(`${tag}: enunciado duplicado no lote`);
  seenEnun.add(e);
});

console.log('=== VALIDAÇÃO (pós-rebalanceamento) ===');
console.log('Novas questões:', novas.length);
console.log('Distribuição letra correta:', JSON.stringify(letterCount));
console.log('Correta = a mais longa (qualquer margem):', correctStrictLongest, '/', novas.length, '(' + Math.round(correctStrictLongest/novas.length*100) + '%)');
console.log('Correta = mais longa por margem (>10%):', correctLongestByMargin, '/', novas.length);
console.log('maxId atual:', maxId, '=> novos ids', maxId + 1, 'a', maxId + novas.length);
if (warnings.length) { console.log('\n-- AVISOS --'); warnings.forEach(w => console.log(' ', w)); }
if (errors.length) { console.log('\n!! ERROS !!'); errors.forEach(e => console.log(' ', e)); console.log('\nAbortado.'); process.exit(1); }

if (!APPLY) { console.log('\n(dry-run) OK. Use --apply para mesclar.'); process.exit(0); }

let id = maxId;
const objs = novas.map(q => ({
  id: ++id,
  disciplina: DISCIPLINA,
  conteudo: q.conteudo,
  tipo: 'multipla_escolha',
  enunciado: q.enunciado,
  alternativas: q.alternativas,
  resposta_correta: q.resposta_correta,
  justificativa: q.justificativa,
  referencia: q.referencia,
  nivel: q.nivel
}));

let src = fs.readFileSync(BANK, 'utf8');
const lastBracket = src.lastIndexOf('];');
if (lastBracket === -1) { console.log('Não encontrei "];" final.'); process.exit(1); }
const before = src.slice(0, lastBracket).replace(/\s*$/, '');
const after = src.slice(lastBracket);
const block = objs.map(o => '  ' + JSON.stringify(o, null, 2).split('\n').join('\n  ')).join(',\n');
fs.writeFileSync(BANK, before + ',\n' + block + '\n' + after);
console.log('\nMesclado! Novos ids:', maxId + 1, 'a', id);
