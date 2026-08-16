// Anexa um lote de questoes ao banco. banco_questoes.js e o arquivo que o app
// carrega; o .json e espelho. Aborta se algum id ja existir.
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..');
const JS = path.join(RAIZ, 'banco_questoes.js');
const JSON_ = path.join(RAIZ, 'banco_questoes.json');
const NOVAS = JSON.parse(fs.readFileSync(path.join(__dirname, 'questoes_cap4.json'), 'utf8'));

const src = fs.readFileSync(JS, 'utf8');
const banco = eval(src.replace(/^const questoesDB\s*=/, '').replace(/;\s*$/, ''));

const existentes = new Set(banco.map(q => q.id));
const colisao = NOVAS.filter(q => existentes.has(q.id));
if (colisao.length) {
    console.error('ABORTADO — ids ja existentes:', colisao.map(q => q.id).join(', '));
    process.exit(1);
}

const final = banco.concat(NOVAS);
fs.writeFileSync(JS, 'const questoesDB = ' + JSON.stringify(final, null, 2) + ';\n', 'utf8');
fs.writeFileSync(JSON_, JSON.stringify(final, null, 2) + '\n', 'utf8');

const cap4 = final.filter(q => /Cap\. 4 /.test(q.conteudo || '') && /LOC/.test(q.disciplina));
const visiveis = cap4.filter(q => q.essencial !== false).length;
console.log('banco: %d -> %d (+%d)', banco.length, final.length, NOVAS.length);
console.log('Cap. 4 do LOC: %d questoes (%d visiveis)', cap4.length, visiveis);
console.log('ids novos: %d a %d', NOVAS[0].id, NOVAS[NOVAS.length - 1].id);
