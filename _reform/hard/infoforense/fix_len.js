// Corrige o "tell de tamanho" em questions2.json: enquanto a alternativa correta
// for a mais longa por >10%, acrescenta uma cláusula plausível (de um pool rotativo)
// ao MAIOR distrator, preservando o valor-verdade (cláusulas são apelos vagos).
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, 'questions2.json');
const arr = JSON.parse(fs.readFileSync(SRC, 'utf8'));

const pool = [
  ', conforme prevê o material didático da disciplina',
  ', segundo a metodologia pericial usualmente adotada',
  ', de acordo com as práticas recomendadas na área',
  ', como se observa na rotina da unidade de criminalística',
  ', nos termos dos normativos técnicos aplicáveis',
  ', consoante a doutrina especializada sobre o tema'
];
let pi = 0;
let ajustes = 0;

for (const q of arr) {
  const c = q.resposta_correta;
  let guard = 0;
  function lens() {
    return Object.entries(q.alternativas).map(([k, v]) => [k, v.length]);
  }
  while (guard++ < 4) {
    const L = lens();
    const correta = L.find(([k]) => k === c)[1];
    const outras = L.filter(([k]) => k !== c);
    const maior = Math.max(...outras.map(([, l]) => l));
    if (correta <= maior * 1.10) break;
    // acha o maior distrator e acrescenta uma cláusula
    outras.sort((a, b) => b[1] - a[1]);
    const alvo = outras[0][0];
    let txt = q.alternativas[alvo];
    txt = txt.replace(/\.$/, '') + pool[pi % pool.length] + '.';
    pi++;
    q.alternativas[alvo] = txt;
    ajustes++;
  }
}

fs.writeFileSync(SRC, JSON.stringify(arr, null, 2) + '\n', 'utf8');
console.log('Ajustes aplicados:', ajustes);
