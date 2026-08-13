// Monta os cadernos "LOC essencial" — seleção enxuta dos capítulos 13 a 17,
// SEM apagar nada do banco. Gera um snippet para colar no console do navegador,
// que grava os cadernos em localStorage (a sincronização com a nuvem é do app).
//
// CRITÉRIO DA SELEÇÃO
// - As questões ANTIGAS (id < 3116) entram todas: são do estilo "assinale a
//   correta", com vários fatos por questão, então já são densas por natureza.
// - Das questões de MATRIZ que eu criei, entra um subconjunto: quando cinco
//   questões percorrem a mesma lista, duas ou três já expõem a matriz inteira,
//   porque o que sai como resposta continua presente como distrator nas outras.
//   Nenhum fato do caderno some da seleção — ele só deixa de ser a resposta.
import { readFileSync, writeFileSync } from 'fs';

const SELECAO = {
  'Cap. 13 - Vestígios e a dinâmica dos fatos': [3162, 3163, 3165],
  'Cap. 14 - Vestígios químicos': [
    3166, 3167, 3171, 3172, 3173, 3174, 3175, 3176,
    3178, 3179, 3182, 3184, 3187, 3188, 3189, 3190, 3191,
  ],
  'Cap. 15 - Vestígios biológicos': [
    3209, 3212, 3214, 3217, 3219, 3220, 3228, 3230,
    3235, 3239, 3241, 3244, 3245, 3250, 3256, 3258, 3259, 3260,
  ],
  'Cap. 16 - Vestígios físicos': [3193, 3195, 3196, 3198, 3200, 3203, 3205, 3207, 3208],
  'Cap. 17 - Microvestígios': [
    3116, 3118, 3120, 3121, 3122, 3123, 3124, 3128, 3132, 3133, 3136,
    3138, 3140, 3142, 3143, 3146, 3148, 3149, 3150, 3153, 3154, 3156, 3161,
  ],
};

const banco = JSON.parse(readFileSync('banco_questoes.json', 'utf8'));
const porId = new Map(banco.map((q) => [q.id, q]));
const LOC = 'LOC - Locais de Crime e suas Interfaces';

const cadernos = [];
let totalSel = 0, totalCap = 0;
const erros = [];

for (const [cap, escolhidas] of Object.entries(SELECAO)) {
  const doCap = banco.filter((q) => q.disciplina === LOC && q.conteudo === cap);
  const antigas = doCap.filter((q) => q.id < 3116).map((q) => q.id);

  for (const id of escolhidas) {
    const q = porId.get(id);
    if (!q) erros.push(`id ${id} não existe no banco`);
    else if (q.conteudo !== cap) erros.push(`id ${id} é de "${q.conteudo}", não de "${cap}"`);
  }

  // Ordem de estudo: segue a página do caderno, misturando antigas e novas.
  const ids = [...antigas, ...escolhidas].sort((a, b) => {
    const pa = parseInt(String(porId.get(a)?.referencia || '').replace(/\D+/g, '') || '0', 10);
    const pb = parseInt(String(porId.get(b)?.referencia || '').replace(/\D+/g, '') || '0', 10);
    return pa - pb || a - b;
  });

  cadernos.push({ nome: `LOC essencial — ${cap.replace(' - ', ': ')}`, questaoIds: ids });
  totalSel += ids.length;
  totalCap += doCap.length;
  console.log(`${cap.padEnd(42)} ${String(doCap.length).padStart(3)} no banco → ${String(ids.length).padStart(3)} no caderno  (${antigas.length} antigas + ${escolhidas.length} de matriz)`);
}

console.log(`\nTOTAL: ${totalCap} questões nos capítulos 13-17 → ${totalSel} nos cadernos (${totalCap - totalSel} ficam fora, sem serem apagadas)`);
if (erros.length) { console.log('\n❌ ' + erros.join('\n❌ ')); process.exit(1); }

// ── Snippet para o console do navegador ─────────────────────────────────────
const snippet = `/* Cadernos "LOC essencial" — cole no console do simulador (F12 > Console).
   Não apaga nada: só cria ${cadernos.length} cadernos com a seleção enxuta.
   Rodar de novo substitui os cadernos de mesmo nome, sem duplicar. */
(function () {
  var NOVOS = ${JSON.stringify(cadernos, null, 2)};
  var KEY = 'pcpr_cadernos';
  var atuais = [];
  try { atuais = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { atuais = []; }
  var nomes = NOVOS.map(function (n) { return n.nome; });
  atuais = atuais.filter(function (c) { return nomes.indexOf(c.nome) === -1; });
  var agora = Date.now();
  NOVOS.forEach(function (n, i) {
    atuais.unshift({
      id: 'cad_' + agora + '_' + i,
      nome: n.nome,
      tipo: 'caderno',
      curado: true,
      disciplinas: ['${LOC}'],
      questaoIds: n.questaoIds,
      posicao: 0,
      respostas: {},
      rodadas: [],
      criadoEm: agora,
      atualizadoEm: agora
    });
  });
  localStorage.setItem(KEY, JSON.stringify(atuais));
  if (typeof cadernosCarregar === 'function') cadernosCarregar();
  if (typeof renderCadernosPainel === 'function') renderCadernosPainel();
  if (typeof requestCloudSync === 'function') requestCloudSync();
  console.log('✅ ' + NOVOS.length + ' cadernos criados (' + NOVOS.reduce(function (s, n) { return s + n.questaoIds.length; }, 0) + ' questões). Recarregue a página se o painel não atualizar.');
})();`;

writeFileSync('cadernos_loc_essencial.js', snippet, 'utf8');
console.log('\n✅ snippet gravado em cadernos_loc_essencial.js');
