// Extrai as questões EM ESCOPO (a reformular) por disciplina+conteúdo para arquivos de entrada.
const fs = require('fs');
const path = require('path');
const db = require('../banco_questoes.json');

// disciplina -> { excludeCaps: [num,...] }  (capítulos a NÃO mexer)
const SCOPE = {
  'Criminalística': { excludeCaps: [14, 15, 17] },
  'PCEB - Balística Forense': { excludeCaps: [] },
  'PCEB - Bombas e Explosivos': { excludeCaps: [1] },
  'PVAT - Módulo I (Identificação Veicular)': { excludeCaps: [1] },
  'PVAT - Módulo II (Acidentes de Tráfego)': { excludeCaps: [1] },
};
// Disciplinas inteiras a pular: IPO e IPO II (não entram no SCOPE)

const capNum = (conteudo) => {
  const m = (conteudo || '').match(/Cap\.?\s*(\d+)/i);
  return m ? parseInt(m[1]) : null;
};
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60);

const inDir = path.join(__dirname, 'in');
const outDir = path.join(__dirname, 'out');
fs.mkdirSync(inDir, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

const groups = {};
db.forEach(q => {
  const sc = SCOPE[q.disciplina];
  if (!sc) return;                       // disciplina fora de escopo
  const n = capNum(q.conteudo);
  if (n !== null && sc.excludeCaps.includes(n)) return;  // capítulo preservado
  const key = slug(q.disciplina) + '__' + slug(q.conteudo);
  (groups[key] = groups[key] || []).push(q);
});

let totalQ = 0;
const manifest = [];
Object.entries(groups).forEach(([key, arr]) => {
  arr.sort((a, b) => a.id - b.id);
  fs.writeFileSync(path.join(inDir, key + '.json'), JSON.stringify(arr, null, 2));
  totalQ += arr.length;
  manifest.push({ key, disciplina: arr[0].disciplina, conteudo: arr[0].conteudo, n: arr.length });
});
manifest.sort((a, b) => a.disciplina.localeCompare(b.disciplina) || a.key.localeCompare(b.key));
fs.writeFileSync(path.join(__dirname, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log('Arquivos de entrada:', manifest.length, '| questões em escopo:', totalQ);
const byDisc = {};
manifest.forEach(m => { byDisc[m.disciplina] = (byDisc[m.disciplina] || 0) + m.n; });
console.log(byDisc);
