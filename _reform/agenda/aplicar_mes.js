/*
 * Substitui a pauta de um mês em agenda_dados.js pelo conteúdo de um JSON.
 * Mostra o diff dia a dia antes de gravar.
 * Uso: node _reform/agenda/aplicar_mes.js <mes-id> <arquivo.json> [--apply]
 *   ex: node _reform/agenda/aplicar_mes.js 08-2026 _reform/agenda/agosto_2026.json --apply
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const ARQ = path.join(ROOT, 'agenda_dados.js');
const MES = process.argv[2];
const JSONF = process.argv[3];
const APPLY = process.argv.includes('--apply');

if (!MES || !JSONF) { console.log('Uso: node aplicar_mes.js <mes-id> <arquivo.json> [--apply]'); process.exit(1); }

function carregar() {
  const s = fs.readFileSync(ARQ, 'utf8');
  const tmp = path.join(__dirname, '__a.js');
  fs.writeFileSync(tmp, s.replace(/^const agendaDados =/m, 'module.exports ='));
  const o = require(tmp); fs.unlinkSync(tmp); return o;
}

const dados = carregar();
const antes = dados.pautas.pcf[MES] || [];
const depois = JSON.parse(fs.readFileSync(path.resolve(ROOT, JSONF), 'utf8'));

const H = { '08h00 a 09h40': '1', '10h00 a 11h40': '2', '13h50 a 15h30': '3',
            '15h50 a 17h30': '4', '17h50 a 19h30': '5', 'Extra': 'X' };
const resumo = (d) => d.blocos.map(b => (H[b.horario] || b.horario) + ':' + b.aula).join(' | ');
const porDia = (arr) => Object.fromEntries(arr.map(d => [d.dia, d]));

const A = porDia(antes), B = porDia(depois);
const dias = [...new Set([...Object.keys(A), ...Object.keys(B)])].sort();

let mudou = 0;
for (const dia of dias) {
  const a = A[dia], b = B[dia];
  if (!a) { console.log(`+ ${dia}: ${resumo(b)}`); mudou++; continue; }
  if (!b) { console.log(`- ${dia}: (removido) ${resumo(a)}`); mudou++; continue; }
  if (resumo(a) !== resumo(b)) {
    console.log(`~ ${dia}:`);
    console.log(`    antes: ${resumo(a)}`);
    console.log(`    novo : ${resumo(b)}`);
    mudou++;
  }
}
console.log(`\nDias no mes: ${antes.length} -> ${depois.length} | alterados/novos/removidos: ${mudou}`);

if (!APPLY) { console.log('(dry-run) Use --apply para gravar.'); process.exit(0); }

dados.pautas.pcf[MES] = depois;
const saida = '// ==========================================\n' +
  '// BANCO DE DADOS DA AGENDA DO CURSO (PAUTA)\n' +
  '// ==========================================\n\n' +
  'const agendaDados = ' + JSON.stringify(dados, null, 4) + ';\n';
fs.writeFileSync(ARQ, saida);
console.log('agenda_dados.js atualizado.');
