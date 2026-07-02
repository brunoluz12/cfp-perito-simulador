// Alonga o maior distrator de cada patch cuja correta seja a mais longa (>10%).
const fs = require('fs');
const path = require('path');
const f = process.argv.find(a => a.endsWith('.json')) || 'pvat1_patch.json';
const SRC = path.join(__dirname, f);
const arr = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const pool = [
  ', conforme prevê o material didático da disciplina',
  ', segundo a interpretação usual dessa normativa',
  ', de acordo com as práticas periciais recomendadas',
  ', como se observa nos casos concretos de perícia veicular',
  ', nos termos da regulamentação técnica aplicável',
  ', consoante a doutrina especializada sobre identificação veicular'
];
let pi = 0, ajustes = 0;
for (const p of arr) {
  const c = p.resposta_correta; let guard = 0;
  while (guard++ < 4) {
    const L = Object.entries(p.alternativas).map(([k, v]) => [k, v.length]);
    const correta = L.find(([k]) => k === c)[1];
    const outras = L.filter(([k]) => k !== c).sort((a, b) => b[1] - a[1]);
    if (correta <= outras[0][1] * 1.10) break;
    const alvo = outras[0][0];
    p.alternativas[alvo] = p.alternativas[alvo].replace(/\.$/, '') + pool[pi++ % pool.length] + '.';
    ajustes++;
  }
}
fs.writeFileSync(SRC, JSON.stringify(arr, null, 2) + '\n', 'utf8');
console.log('Ajustes:', ajustes);
