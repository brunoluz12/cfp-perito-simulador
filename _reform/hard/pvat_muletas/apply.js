// Aplica patch por id em banco_questoes.js (reescreve alternativas/resposta_correta).
// Uso: node apply.js <patch.json>          (dry-run)
//      node apply.js <patch.json> --apply   (grava)
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../../..');
const BANK = path.join(ROOT, 'banco_questoes.js');
const patchFile = process.argv.find(a => a.endsWith('.json'));
if (!patchFile) { console.error('informe o arquivo de patch .json'); process.exit(1); }
const patches = JSON.parse(fs.readFileSync(path.join(__dirname, patchFile), 'utf8'));

let s = fs.readFileSync(BANK, 'utf8').replace(/const\s+questoesDB\s*=/, 'global.__DB=');
eval(s);
const bank = global.__DB;
const byId = new Map(bank.map(q => [q.id, q]));

const crutch = /\b(sempre|nunca|apenas|somente|exclusivamente|jamais|obrigatoriamente|vedad|dispensa)\b/i;
const problemas = [];
let ok = 0;
for (const p of patches) {
  const q = byId.get(p.id);
  if (!q) { problemas.push(`id ${p.id}: não encontrado`); continue; }
  const alts = p.alternativas, corr = p.resposta_correta;
  const keys = Object.keys(alts);
  if (keys.length !== 4 || !['A', 'B', 'C', 'D'].every(k => keys.includes(k))) { problemas.push(`id ${p.id}: alternativas != A,B,C,D`); continue; }
  if (!['A', 'B', 'C', 'D'].includes(corr)) { problemas.push(`id ${p.id}: resposta_correta inválida`); continue; }
  // relatórios de qualidade
  const errComCrutch = Object.entries(alts).filter(([k, v]) => k !== corr && crutch.test(v)).length;
  const corrComCrutch = crutch.test(alts[corr]);
  const lens = Object.entries(alts).map(([k, v]) => [k, v.length]);
  const cl = lens.find(([k]) => k === corr)[1];
  const maiorOutra = Math.max(...lens.filter(([k]) => k !== corr).map(([, l]) => l));
  if (errComCrutch >= 2 && !corrComCrutch) problemas.push(`id ${p.id}: AINDA tem >=2 erradas com absoluto e correta sem (tell persiste)`);
  if (cl > maiorOutra * 1.10) problemas.push(`id ${p.id}: correta é a mais longa por >10% (${cl} vs ${maiorOutra})`);
  if (p.enunciado) q.enunciado = p.enunciado;
  q.alternativas = alts;
  q.resposta_correta = corr;
  ok++;
}
console.log(`Patches: ${patches.length} | aplicados (em memória): ${ok}`);
if (problemas.length) { console.log('AVISOS:'); problemas.forEach(x => console.log('  - ' + x)); }
else console.log('Sem avisos.');

if (process.argv.includes('--apply')) {
  fs.writeFileSync(BANK, 'const questoesDB = ' + JSON.stringify(bank, null, 2) + ';\n', 'utf8');
  console.log('>> GRAVADO.');
} else console.log('(dry-run) rode com --apply para gravar.');
