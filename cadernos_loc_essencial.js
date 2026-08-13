/* Cadernos "LOC essencial" — cole no console do simulador (F12 > Console).
   Não apaga nada: só cria 5 cadernos com a seleção enxuta.
   Rodar de novo substitui os cadernos de mesmo nome, sem duplicar. */
(function () {
  var NOVOS = [
  {
    "nome": "LOC essencial — Cap. 13: Vestígios e a dinâmica dos fatos",
    "questaoIds": [
      1423,
      1424,
      1425,
      2177,
      3162,
      3163,
      3165,
      1426,
      1427,
      2178
    ]
  },
  {
    "nome": "LOC essencial — Cap. 14: Vestígios químicos",
    "questaoIds": [
      1429,
      3171,
      3166,
      3167,
      1430,
      2179,
      3172,
      3173,
      3174,
      3175,
      3176,
      3178,
      3179,
      3182,
      3184,
      1434,
      3187,
      3188,
      3189,
      1436,
      1437,
      3190,
      3191,
      1428,
      1431,
      1432,
      1433,
      1435,
      2180
    ]
  },
  {
    "nome": "LOC essencial — Cap. 15: Vestígios biológicos",
    "questaoIds": [
      1438,
      1439,
      1440,
      2181,
      3209,
      3212,
      3214,
      3217,
      3219,
      3220,
      1442,
      3228,
      3230,
      3235,
      3239,
      1444,
      3241,
      1445,
      2182,
      3244,
      3245,
      1447,
      3250,
      3256,
      1446,
      3258,
      3259,
      3260,
      1448,
      2674,
      1441,
      1443,
      1449,
      2672,
      2673,
      2675,
      2670,
      2671
    ]
  },
  {
    "nome": "LOC essencial — Cap. 16: Vestígios físicos",
    "questaoIds": [
      1450,
      3208,
      1451,
      1452,
      3195,
      3196,
      3198,
      1454,
      1456,
      3200,
      3203,
      3205,
      1457,
      1458,
      1459,
      3207,
      3193,
      2183,
      1453,
      1455,
      2184
    ]
  },
  {
    "nome": "LOC essencial — Cap. 17: Microvestígios",
    "questaoIds": [
      1460,
      1461,
      3161,
      3136,
      1462,
      3128,
      3132,
      3116,
      3122,
      3124,
      3143,
      2186,
      3118,
      3120,
      3121,
      3123,
      3138,
      1466,
      3146,
      3148,
      3149,
      3150,
      1468,
      3154,
      3156,
      3133,
      3142,
      1463,
      1464,
      2185,
      3140,
      1465,
      1467,
      3153,
      1469
    ]
  }
];
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
      disciplinas: ['LOC - Locais de Crime e suas Interfaces'],
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
})();