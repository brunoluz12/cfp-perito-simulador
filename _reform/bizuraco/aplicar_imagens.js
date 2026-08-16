// Anexa as questoes com imagem ao banco (banco_questoes.js e o arquivo que o
// app carrega; o .json e espelho para inspecao). Confere ids duplicados antes.
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..');
const JS = path.join(RAIZ, 'banco_questoes.js');
const JSON_ = path.join(RAIZ, 'banco_questoes.json');
const NOVAS = JSON.parse(fs.readFileSync(path.join(__dirname, 'questoes_bizuraco_imagens.json'), 'utf8'));

const src = fs.readFileSync(JS, 'utf8');
const banco = eval(src.replace(/^const questoesDB\s*=/, '') .replace(/;\s*$/, ''));

const idsExistentes = new Set(banco.map(q => q.id));
const colisao = NOVAS.filter(q => idsExistentes.has(q.id));
if (colisao.length) {
    console.error('ABORTADO — ids ja existentes:', colisao.map(q => q.id).join(', '));
    process.exit(1);
}

const final = banco.concat(NOVAS);
fs.writeFileSync(JS, 'const questoesDB = ' + JSON.stringify(final, null, 2) + ';\n', 'utf8');
fs.writeFileSync(JSON_, JSON.stringify(final, null, 2) + '\n', 'utf8');

const comImagem = final.filter(q => q.imagem).length;
console.log('banco: %d -> %d questoes (+%d)', banco.length, final.length, NOVAS.length);
console.log('questoes com imagem no banco: %d', comImagem);
console.log('ids novos: %d a %d', NOVAS[0].id, NOVAS[NOVAS.length - 1].id);
