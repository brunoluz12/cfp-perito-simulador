// Conversão das questões de 5 alternativas (A-E) para 4 (A-D).
// Opera sobre o banco_questoes.js ATUAL (preserva LOC e tudo mais). Idempotente.
//
// FASE 1 (automática): para questões 5-alt cuja resposta != E E cuja justificativa
//   NÃO cita a alternativa "E" (E isolado como rótulo), remove a alternativa E,
//   mantendo A-D, a mesma resposta e a justificativa intactas.
// FASES 2/3 (manuais): correções específicas vêm de _reform/convert/*.json
//   (cada item: {id, alternativas{A,B,C,D}, resposta_correta, justificativa?, enunciado?, referencia?}).
//   Têm precedência e cobrem os casos resposta=E (renumeração) e justificativa que cita E.
//
// Uso: node _reform/convert_ad.js [--apply]
const fs = require('fs');
const path = require('path');

const bankPath = path.join(__dirname, '..', 'banco_questoes.js');
let questoesDB;
eval(fs.readFileSync(bankPath, 'utf8').replace('const questoesDB', 'questoesDB'));

// manuais
const convDir = path.join(__dirname, 'convert');
const manual = new Map();
const errors = [];
if (fs.existsSync(convDir)) {
  for (const f of fs.readdirSync(convDir).filter(f => f.endsWith('.json'))) {
    let arr;
    try { arr = JSON.parse(fs.readFileSync(path.join(convDir, f), 'utf8')); }
    catch (e) { errors.push(`${f}: JSON inválido (${e.message})`); continue; }
    for (const r of arr) { if (manual.has(r.id)) errors.push(`id ${r.id}: duplicado em ${f}`); manual.set(r.id, r); }
  }
}

// detecta "E" isolado (rótulo de alternativa) na justificativa
const standaloneE = s => /(^|[^0-9A-Za-zÀ-ÿ])E([^0-9A-Za-zÀ-ÿ]|$)/.test(s || '');

let auto = 0, manualApplied = 0, skipped5 = 0;
const leftover = {};

questoesDB.forEach((q, i) => {
  const keys = Object.keys(q.alternativas || {});
  // manual tem precedência
  if (manual.has(q.id)) {
    const r = manual.get(q.id);
    let alts, resp;
    if (r.alternativas) {
      // entrada completa: usa alternativas/resposta fornecidas (reescrita total)
      alts = r.alternativas;
      resp = r.resposta_correta;
    } else if (r.dropLetter) {
      // entrada leve {id, dropLetter, justificativa}: remove o distrator dropLetter,
      // renumera as 4 restantes em ordem para A-D e remapeia a resposta correta.
      const order = ['A', 'B', 'C', 'D', 'E'];
      if (!order.includes(r.dropLetter)) { errors.push(`id ${q.id}: dropLetter inválido`); return; }
      if (r.dropLetter === q.resposta_correta) { errors.push(`id ${q.id}: dropLetter não pode ser a resposta correta`); return; }
      const kept = order.filter(k => k !== r.dropLetter && q.alternativas[k] != null);
      if (kept.length !== 4) { errors.push(`id ${q.id}: apos remover ${r.dropLetter} nao restaram 4 alternativas`); return; }
      alts = {}; let newResp = null;
      kept.forEach((k, idx) => { const nl = order[idx]; alts[nl] = q.alternativas[k]; if (k === q.resposta_correta) newResp = nl; });
      resp = r.resposta_correta || newResp;
    } else {
      // entrada leve {id, justificativa}: apenas remove E, mantém A-D do original
      if (q.resposta_correta === 'E') { errors.push(`id ${q.id}: manual leve (sem alternativas) mas resposta=E — use dropLetter ou alternativas`); return; }
      alts = { A: q.alternativas.A, B: q.alternativas.B, C: q.alternativas.C, D: q.alternativas.D };
      resp = r.resposta_correta || q.resposta_correta;
    }
    const kk = Object.keys(alts || {});
    const ok = ['A', 'B', 'C', 'D'].every(k => kk.includes(k)) && kk.length === 4;
    if (!ok) { errors.push(`id ${q.id}: manual sem A-D exatas`); return; }
    if (!['A', 'B', 'C', 'D'].includes(resp) || !alts[resp]) { errors.push(`id ${q.id}: resposta_correta manual inválida`); return; }
    if (r.justificativa == null) { errors.push(`id ${q.id}: manual sem justificativa`); return; }
    questoesDB[i] = {
      ...q,
      enunciado: r.enunciado != null ? r.enunciado : q.enunciado,
      alternativas: { A: alts.A, B: alts.B, C: alts.C, D: alts.D },
      resposta_correta: resp,
      justificativa: r.justificativa,
      referencia: r.referencia != null ? r.referencia : q.referencia
    };
    manualApplied++;
    return;
  }
  if (keys.length === 5) {
    if (q.resposta_correta !== 'E' && !standaloneE(q.justificativa)) {
      questoesDB[i] = { ...q, alternativas: { A: q.alternativas.A, B: q.alternativas.B, C: q.alternativas.C, D: q.alternativas.D } };
      auto++;
    } else {
      skipped5++;
      leftover[q.disciplina] = leftover[q.disciplina] || { total: 0, respE: 0, citaE: 0 };
      leftover[q.disciplina].total++;
      if (q.resposta_correta === 'E') leftover[q.disciplina].respE++; else leftover[q.disciplina].citaE++;
    }
  }
});

// contagem final
let c4 = 0, c5 = 0, co = 0;
questoesDB.forEach(q => { const k = Object.keys(q.alternativas || {}).length; if (k === 4) c4++; else if (k === 5) c5++; else co++; });

console.log(JSON.stringify({
  autoConvertidas: auto,
  manuaisAplicadas: manualApplied,
  aindaA_E_apos: c5,
  leftoverPorDisciplina: leftover,
  totalBanco: questoesDB.length,
  formatoFinal: { A_D: c4, A_E: c5, outro: co },
  erros: errors.slice(0, 40),
  numErros: errors.length
}, null, 2));

const APPLY = process.argv.includes('--apply');
if (errors.length && APPLY) { console.error('\nABORTADO: corrija os erros antes de aplicar.'); process.exit(1); }
if (APPLY) {
  fs.writeFileSync(path.join(__dirname, '..', 'banco_questoes.json'), JSON.stringify(questoesDB, null, 2));
  fs.writeFileSync(bankPath, 'const questoesDB = ' + JSON.stringify(questoesDB, null, 2) + ';\n');
  console.log('\nAPLICADO: banco_questoes.js e banco_questoes.json regenerados.');
}
