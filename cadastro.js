// ==========================================
// CADASTRO EM ETAPAS (Pix → dados → comprovante → enviado)
// ------------------------------------------------------------------
// O acesso é pago: quem chega faz o Pix, preenche os dados, anexa o
// comprovante e fica aguardando. O administrador confere nome e comprovante
// no painel antes de liberar. A conta só nasce aqui — o login não cria mais
// nada: usuário inexistente é mandado para cá.
// ==========================================

// Reduz a foto do comprovante antes de subir: print de celular costuma vir
// com 2-4 MB e a API aceita ~700 KB. PDF vai como está (com limite de tamanho).
const COMPROVANTE_MAX_DATAURL = 700000;
const COMPROVANTE_LARGURA_MAX = 1100;

const CADASTRO_ULTIMA_ETAPA = 4; // a tela de "enviado"

// Guarda o comprovante já preparado, para não reprocessar no envio.
let comprovanteCadastro = null;
let etapaCadastro = 1;

// ==========================================
// ARQUIVO DO COMPROVANTE
// ==========================================

function lerArquivoComoDataURL(file) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();
        leitor.onload = () => resolve(leitor.result);
        leitor.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
        leitor.readAsDataURL(file);
    });
}

async function prepararComprovante(file) {
    if (!file) throw new Error('Anexe o comprovante do Pix.');

    if (file.type === 'application/pdf') {
        const dataUrl = await lerArquivoComoDataURL(file);
        if (dataUrl.length > COMPROVANTE_MAX_DATAURL) {
            throw new Error('Esse PDF é grande demais. Envie um print da tela do comprovante.');
        }
        return dataUrl;
    }

    if (!file.type.startsWith('image/')) {
        throw new Error('Envie uma imagem (print do comprovante) ou um PDF.');
    }

    const dataUrl = await lerArquivoComoDataURL(file);
    const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error('Não consegui abrir essa imagem.'));
        i.src = dataUrl;
    });

    // Vai baixando qualidade e, se ainda não couber, também o tamanho. Um
    // comprovante é texto grande em fundo liso, então aguenta bem a compressão.
    let largura = Math.min(COMPROVANTE_LARGURA_MAX, Math.max(img.width, img.height));
    for (let rodada = 0; rodada < 3; rodada++) {
        const escala = largura / Math.max(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * escala));
        canvas.height = Math.max(1, Math.round(img.height * escala));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

        for (const qualidade of [0.75, 0.6, 0.45, 0.3]) {
            const saida = canvas.toDataURL('image/jpeg', qualidade);
            if (saida.length <= COMPROVANTE_MAX_DATAURL) return saida;
        }
        largura = Math.round(largura * 0.6);
    }
    throw new Error('Não consegui reduzir essa imagem o bastante. Tente um print da tela do comprovante.');
}

// ==========================================
// MENSAGENS DA TELA DE LOGIN/CADASTRO
// ==========================================

function esconderMensagensLogin() {
    ['login-status-msg', 'login-pending-msg', 'login-blocked-msg', 'login-invalid-msg',
     'login-notfound-msg', 'login-badname-msg', 'login-weak-msg', 'login-erro-msg',
     'login-offline-msg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
}

function mostrarMensagemLogin(id, texto) {
    esconderMensagensLogin();
    const el = document.getElementById(id);
    if (!el) return;
    if (texto) {
        const icone = el.querySelector('i');
        el.textContent = ' ' + texto;
        if (icone) el.prepend(icone);
    }
    el.classList.remove('hidden');
}

// ==========================================
// NAVEGAÇÃO ENTRE AS ETAPAS
// ==========================================

function irParaEtapa(n) {
    etapaCadastro = n;
    document.querySelectorAll('.cadastro-etapa').forEach(el => {
        el.hidden = Number(el.dataset.etapa) !== n;
    });

    // Trilha do topo: passo atual em destaque, anteriores como concluídos.
    // Na tela final ela sai, junto com o link de voltar ao login.
    const trilha = document.getElementById('cadastro-passos');
    const rodape = document.getElementById('cadastro-rodape');
    const fim = n >= CADASTRO_ULTIMA_ETAPA;
    if (trilha) {
        trilha.hidden = fim;
        trilha.querySelectorAll('li').forEach(li => {
            const passo = Number(li.dataset.passo);
            li.classList.toggle('passo-atual', passo === n);
            li.classList.toggle('passo-feito', passo < n);
        });
    }
    if (rodape) rodape.hidden = fim;

    const titulo = document.getElementById('cadastro-titulo');
    if (titulo) titulo.textContent = fim ? 'Tudo certo!' : 'Criar cadastro';

    esconderMensagensLogin();
}

function mostrarPainelCadastro(mostrar) {
    const login = document.getElementById('login-painel');
    const cadastro = document.getElementById('cadastro-painel');
    if (login) login.hidden = mostrar;
    if (cadastro) cadastro.hidden = !mostrar;
    if (mostrar) irParaEtapa(1);
    esconderMensagensLogin();
    const wrap = document.getElementById('login-reenviar-wrap');
    if (wrap) wrap.hidden = true;
}

// ==========================================
// VALIDAÇÃO DA ETAPA DOS DADOS
// ==========================================

// Devolve a mensagem do primeiro problema, ou null se estiver tudo certo.
function problemaNosDados() {
    const nome = document.getElementById('cad-nome').value.trim();
    const email = document.getElementById('cad-email').value.trim();
    const usuario = document.getElementById('cad-usuario').value.trim();
    const senha = document.getElementById('cad-senha').value;
    const senha2 = document.getElementById('cad-senha2').value;

    if (nome.split(/\s+/).filter(Boolean).length < 2) return 'Escreva seu nome completo (nome e sobrenome).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'Confira o e-mail digitado.';
    if (usuario.length < 2) return 'Escolha um usuário com pelo menos 2 caracteres.';
    if (senha.length < 4) return 'A senha precisa ter pelo menos 4 caracteres.';
    if (senha !== senha2) return 'As duas senhas não são iguais.';
    return null;
}

// Mensagens dos erros que a API devolve, e a etapa onde cada um se resolve
const ERROS_CADASTRO = {
    exists: { etapa: 2, msg: 'Esse usuário já está em uso. Escolha outro.' },
    badUsername: { etapa: 2, msg: 'Use apenas letras, números, espaço, ponto, hífen ou sublinhado no usuário.' },
    badNome: { etapa: 2, msg: 'Escreva seu nome completo (nome e sobrenome).' },
    badEmail: { etapa: 2, msg: 'Confira o e-mail digitado.' },
    weak: { etapa: 2, msg: 'A senha precisa ter pelo menos 4 caracteres.' },
    semComprovante: { etapa: 3, msg: 'Anexe o comprovante do Pix.' },
    badComprovante: { etapa: 3, msg: 'Arquivo inválido. Envie uma imagem ou um PDF.' },
    comprovanteGrande: { etapa: 3, msg: 'O arquivo ficou grande demais. Envie um print da tela.' }
};

// ==========================================
// ENVIO
// ==========================================

async function enviarCadastro() {
    const problema = problemaNosDados();
    if (problema) {
        // Algo dos dados escapou: volta para a etapa 2 em vez de só reclamar
        irParaEtapa(2);
        return mostrarMensagemLogin('login-erro-msg', problema);
    }
    if (!comprovanteCadastro) {
        return mostrarMensagemLogin('login-erro-msg', 'Anexe o comprovante do Pix.');
    }

    const nome = document.getElementById('cad-nome').value.trim();
    const email = document.getElementById('cad-email').value.trim();
    const usuario = document.getElementById('cad-usuario').value.trim();
    const senha = document.getElementById('cad-senha').value;
    const btn = document.getElementById('btn-cadastrar');

    btn.disabled = true;
    mostrarMensagemLogin('login-status-msg', 'Enviando seu cadastro...');

    try {
        const resposta = await fetch(`${VERCEL_API_URL}/api/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'register',
                username: usuario,
                password: senha,
                nome,
                email,
                comprovante: comprovanteCadastro
            })
        });
        const resultado = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            const erro = ERROS_CADASTRO[resultado.status];
            if (erro) {
                irParaEtapa(erro.etapa); // leva de volta à etapa que tem o problema
                mostrarMensagemLogin('login-erro-msg', erro.msg);
            } else {
                mostrarMensagemLogin('login-erro-msg', 'Não consegui enviar o cadastro. Tente de novo.');
            }
            return;
        }

        // Enviado: guarda o usuário para já aparecer no login depois
        try { localStorage.setItem('pcpr_current_user', usuario); } catch (e) {}
        comprovanteCadastro = null;
        irParaEtapa(CADASTRO_ULTIMA_ETAPA);
    } catch (e) {
        console.error('Erro no cadastro:', e);
        mostrarMensagemLogin('login-offline-msg');
    } finally {
        btn.disabled = false;
    }
}

// Da tela final de volta para o login, com o usuário preenchido e o aviso
// de que o acesso está em análise.
function concluirCadastro() {
    const usuario = document.getElementById('cad-usuario').value.trim();
    mostrarPainelCadastro(false);
    const campoUsuario = document.getElementById('username-input');
    if (campoUsuario && usuario) campoUsuario.value = usuario;
    mostrarMensagemLogin('login-pending-msg');
    const wrap = document.getElementById('login-reenviar-wrap');
    if (wrap) wrap.hidden = false;
}

// Reenvio do comprovante por quem já se cadastrou e anexou o arquivo errado.
// Exige usuário e senha, então só o dono da conta consegue trocar.
async function reenviarComprovante(file) {
    const usuario = document.getElementById('username-input').value.trim();
    const senha = document.getElementById('password-input').value;

    if (!usuario || !senha) {
        return mostrarMensagemLogin('login-erro-msg', 'Digite seu usuário e senha acima para reenviar o comprovante.');
    }

    mostrarMensagemLogin('login-status-msg', 'Enviando o comprovante...');
    try {
        const comprovante = await prepararComprovante(file);
        const resposta = await fetch(`${VERCEL_API_URL}/api/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'comprovante', username: usuario, password: senha, comprovante })
        });
        const resultado = await resposta.json().catch(() => ({}));
        if (!resposta.ok) {
            const erro = ERROS_CADASTRO[resultado.status];
            const msg = resultado.status === 'invalid'
                ? 'Usuário ou senha incorretos.'
                : (erro ? erro.msg : 'Não consegui enviar o comprovante.');
            return mostrarMensagemLogin('login-erro-msg', msg);
        }
        mostrarMensagemLogin('login-erro-msg', 'Comprovante recebido! Assim que eu conferir, seu acesso é liberado.');
    } catch (e) {
        mostrarMensagemLogin('login-erro-msg', e.message || 'Não consegui enviar o comprovante.');
    }
}

// ==========================================
// LIGAÇÃO COM A TELA
// ==========================================

async function anexarComprovante(file) {
    const rotulo = document.getElementById('cad-comprovante-label');
    const caixa = document.querySelector('.cadastro-arquivo');
    const preview = document.getElementById('cad-comprovante-preview');

    rotulo.textContent = 'Preparando o arquivo...';
    try {
        comprovanteCadastro = await prepararComprovante(file);
        const kb = Math.round(comprovanteCadastro.length * 0.75 / 1024);
        rotulo.textContent = `Comprovante anexado (${kb} KB) — toque para trocar`;
        if (caixa) caixa.classList.add('tem-arquivo');
        if (preview) {
            if (comprovanteCadastro.startsWith('data:image/')) {
                preview.src = comprovanteCadastro;
                preview.hidden = false;
            } else {
                preview.hidden = true;
            }
        }
        esconderMensagensLogin();
    } catch (e) {
        comprovanteCadastro = null;
        rotulo.textContent = 'Anexar comprovante (foto ou PDF)';
        if (caixa) caixa.classList.remove('tem-arquivo');
        if (preview) preview.hidden = true;
        mostrarMensagemLogin('login-erro-msg', e.message);
    }
}

// A chave é copiada e usada crua; na tela ela aparece formatada, porque
// "02481611136" é difícil de conferir a olho.
function formatarChavePix(chave) {
    const digitos = String(chave).replace(/\D/g, '');
    if (/^\d{11}$/.test(chave.trim())) {
        return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return chave;
}

function tipoDaChavePix(chave) {
    const c = String(chave).trim();
    if (/^\d{11}$/.test(c)) return 'CPF';
    if (/^\d{14}$/.test(c)) return 'CNPJ';
    if (c.includes('@')) return 'e-mail';
    if (/^\+?\d{10,13}$/.test(c)) return 'celular';
    return '';
}

async function copiarChavePix() {
    const label = document.getElementById('copiar-pix-label');
    try {
        await navigator.clipboard.writeText(PIX_CHAVE);
        if (label) {
            label.textContent = 'Chave copiada!';
            setTimeout(() => { label.textContent = 'Copiar chave'; }, 2500);
        }
    } catch (e) {
        // Navegador sem permissão de área de transferência: a chave está na tela
        mostrarMensagemLogin('login-erro-msg', 'Não consegui copiar. Anote a chave: ' + PIX_CHAVE);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const chave = document.getElementById('cadastro-pix-chave');
    if (chave) chave.textContent = formatarChavePix(PIX_CHAVE);
    const rotulo = document.querySelector('.cadastro-pix-rotulo');
    const tipo = tipoDaChavePix(PIX_CHAVE);
    if (rotulo && tipo) rotulo.textContent = `Chave Pix (${tipo})`;
    const valor = document.getElementById('cadastro-pix-valor');
    if (valor && PIX_VALOR) valor.textContent = PIX_VALOR;

    const irCadastro = document.getElementById('btn-ir-cadastro');
    if (irCadastro) irCadastro.addEventListener('click', () => mostrarPainelCadastro(true));

    const voltarLogin = document.getElementById('btn-voltar-login');
    if (voltarLogin) voltarLogin.addEventListener('click', () => mostrarPainelCadastro(false));

    const copiar = document.getElementById('btn-copiar-pix');
    if (copiar) copiar.addEventListener('click', copiarChavePix);

    const passo1 = document.getElementById('btn-passo1-avancar');
    if (passo1) passo1.addEventListener('click', () => irParaEtapa(2));

    const passo2 = document.getElementById('btn-passo2-avancar');
    if (passo2) passo2.addEventListener('click', () => {
        const problema = problemaNosDados();
        if (problema) return mostrarMensagemLogin('login-erro-msg', problema);
        irParaEtapa(3);
    });

    document.querySelectorAll('[data-voltar]').forEach(btn => {
        btn.addEventListener('click', () => irParaEtapa(Number(btn.dataset.voltar)));
    });

    const btnCadastrar = document.getElementById('btn-cadastrar');
    if (btnCadastrar) btnCadastrar.addEventListener('click', enviarCadastro);

    const btnFim = document.getElementById('btn-fim-login');
    if (btnFim) btnFim.addEventListener('click', concluirCadastro);

    const arquivo = document.getElementById('cad-comprovante');
    if (arquivo) {
        arquivo.addEventListener('change', () => {
            const file = arquivo.files && arquivo.files[0];
            if (file) anexarComprovante(file);
        });
    }

    const btnReenviar = document.getElementById('btn-reenviar-comprovante');
    const inputReenvio = document.getElementById('reenvio-comprovante');
    if (btnReenviar && inputReenvio) {
        btnReenviar.addEventListener('click', () => inputReenvio.click());
        inputReenvio.addEventListener('change', () => {
            const file = inputReenvio.files && inputReenvio.files[0];
            if (file) reenviarComprovante(file);
        });
    }
});
