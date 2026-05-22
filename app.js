// VARIÁVEIS GLOBAIS
let bancoQuestoes = [];
let simuladoAtual = [];
let questaoAtualIndex = 0;
let acertosSimulado = 0;
let errosSimulado = 0;

// DADOS PESSOAIS
let favoritos = [];
let comentarios = {};
let historicoQuestoes = {};

// ESTATÍSTICAS LOCAIS
let stats = {
    totalResolvidas: 0,
    totalAcertos: 0,
    totalErros: 0
};

// ELEMENTOS DOM
const views = {
    dashboard: document.getElementById('dashboard-view'),
    quiz: document.getElementById('quiz-view'),
    result: document.getElementById('result-view'),
    'control-view': document.getElementById('control-view'),
    'material-view': document.getElementById('material-view')
};

// VARIÁVEIS DE NUVEM
let currentUser = null;
let syncTimeout = null;

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('login-overlay');
    const btnLogin = document.getElementById('btn-login');
    const inputUser = document.getElementById('username-input');
    
    // Auto-preencher
    const savedUser = localStorage.getItem('pcpr_current_user');
    if (savedUser) inputUser.value = savedUser;

    btnLogin.addEventListener('click', () => tryLogin(inputUser.value));
    inputUser.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') tryLogin(inputUser.value);
    });
});

async function tryLogin(username) {
    if (!username || username.trim().length < 2) {
        alert("Digite um nome válido com pelo menos 2 caracteres.");
        return;
    }
    
    const user = username.trim();
    const statusMsg = document.getElementById('login-status-msg');
    const btn = document.getElementById('btn-login');
    
    statusMsg.classList.remove('hidden');
    btn.disabled = true;
    
    try {
        const response = await fetch(`/api/load?username=${encodeURIComponent(user)}`);
        
        if (response.ok) {
            const result = await response.json();
            if (result.data) {
                // Sincronizar dados da nuvem para o local
                if (result.data.stats) localStorage.setItem('pcpr_stats', JSON.stringify(result.data.stats));
                if (result.data.favoritos) localStorage.setItem('pcpr_favorites', JSON.stringify(result.data.favoritos));
                if (result.data.comentarios) localStorage.setItem('pcpr_comments', JSON.stringify(result.data.comentarios));
                if (result.data.historico) localStorage.setItem('pcpr_history', JSON.stringify(result.data.historico));
                if (result.data.progresso) localStorage.setItem('pcpr_course_progress', JSON.stringify(result.data.progresso));
            }
        }
    } catch (e) {
        console.error("Erro ao buscar dados na nuvem. Usando dados locais como fallback.", e);
    }
    
    currentUser = user;
    localStorage.setItem('pcpr_current_user', user);
    
    // Ocultar login e mostrar app
    document.getElementById('login-overlay').classList.add('hidden');
    document.getElementById('main-app-container').style.display = 'block';
    
    // Iniciar fluxo normal do App
    carregarBancoQuestoes();
    carregarDadosPessoais();
    carregarEstatisticas();
    atualizarHeaderStats();
    configurarEventos();
    carregarControleCurso();
}

function requestCloudSync() {
    if (!currentUser) return;
    if (syncTimeout) clearTimeout(syncTimeout);
    
    syncTimeout = setTimeout(async () => {
        const payload = {
            stats: stats,
            favoritos: favoritos,
            comentarios: comentarios,
            historico: historicoQuestoes,
            progresso: progressoCurso
        };
        
        try {
            await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser, data: payload })
            });
            console.log("Progresso salvo na nuvem!");
        } catch (e) {
            console.error("Falha ao salvar na nuvem", e);
        }
    }, 2000); // 2 segundos de debounce para não spammar requisições
}

// CARREGAMENTO DE DADOS
function carregarBancoQuestoes() {
    try {
        if (typeof questoesDB === 'undefined') {
            throw new Error('Variável questoesDB não encontrada. Verifique se o banco_questoes.js está correto.');
        }
        
        bancoQuestoes = questoesDB;
        
        // Extrai disciplinas únicas
        const disciplinas = [...new Set(bancoQuestoes.map(q => q.disciplina))];
        
        const selectDisciplina = document.getElementById('disciplina-select');
        selectDisciplina.innerHTML = '<option value="" disabled selected>Selecione a disciplina</option>';
        
        disciplinas.forEach(disc => {
            const option = document.createElement('option');
            option.value = disc;
            option.textContent = disc;
            selectDisciplina.appendChild(option);
        });

        // Evento para atualizar conteúdos quando a disciplina muda
        selectDisciplina.addEventListener('change', atualizarFiltroConteudo);

        // Habilita botão
        document.getElementById('btn-start').disabled = false;
        document.getElementById('loading-msg').style.display = 'none';

    } catch (error) {
        console.error(error);
        document.getElementById('loading-msg').textContent = "Erro ao carregar banco de questões. " + error.message;
        document.getElementById('loading-msg').style.display = 'block';
        document.getElementById('loading-msg').style.color = 'var(--error-color)';
    }
}

// GESTÃO DE ESTATÍSTICAS
function carregarEstatisticas() {
    const savedStats = localStorage.getItem('pcpr_stats');
    if (savedStats) {
        stats = JSON.parse(savedStats);
    }
    atualizarTelaDashboard();
}

function carregarDadosPessoais() {
    const savedFav = localStorage.getItem('pcpr_favorites');
    if (savedFav) favoritos = JSON.parse(savedFav);
    
    const savedCom = localStorage.getItem('pcpr_comments');
    if (savedCom) comentarios = JSON.parse(savedCom);
    
    const savedHist = localStorage.getItem('pcpr_history');
    if (savedHist) historicoQuestoes = JSON.parse(savedHist);
}

function salvarFavoritos() {
    localStorage.setItem('pcpr_favorites', JSON.stringify(favoritos));
    requestCloudSync();
}

function salvarComentarios() {
    localStorage.setItem('pcpr_comments', JSON.stringify(comentarios));
    requestCloudSync();
}

function salvarHistorico() {
    localStorage.setItem('pcpr_history', JSON.stringify(historicoQuestoes));
    requestCloudSync();
}

function salvarEstatisticas() {
    localStorage.setItem('pcpr_stats', JSON.stringify(stats));
    atualizarTelaDashboard();
    atualizarHeaderStats();
    requestCloudSync();
}

function calcularEstatisticasPorCapitulo() {
    const container = document.getElementById('chapter-stats-list');
    if (!container) return;
    
    const statsPorDisc = {};
    
    bancoQuestoes.forEach(q => {
        const hist = historicoQuestoes[q.id];
        
        // Computa apenas as questões que foram respondidas
        if (hist && hist.status) {
            const disc = q.disciplina || "Sem Disciplina";
            const cap = q.conteudo || q.capitulo || "Geral";
            
            // Inicializa a disciplina e o capítulo
            if (!statsPorDisc[disc]) {
                statsPorDisc[disc] = { resolvidas: 0, acertos: 0, erros: 0, conteudos: {} };
            }
            if (!statsPorDisc[disc].conteudos[cap]) {
                statsPorDisc[disc].conteudos[cap] = { resolvidas: 0, acertos: 0, erros: 0 };
            }
            
            // Incrementa os dados
            statsPorDisc[disc].resolvidas++;
            statsPorDisc[disc].conteudos[cap].resolvidas++;
            
            if (hist.status === 'acerto') {
                statsPorDisc[disc].acertos++;
                statsPorDisc[disc].conteudos[cap].acertos++;
            }
            if (hist.status === 'erro') {
                statsPorDisc[disc].erros++;
                statsPorDisc[disc].conteudos[cap].erros++;
            }
        }
    });
    
    const disciplinas = Object.keys(statsPorDisc).sort();
    
    if (disciplinas.length === 0) {
        container.innerHTML = '<p class="empty-stats-msg">Responda algumas questões com o novo rastreador ativo para ver o seu progresso aqui.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    disciplinas.forEach(disc => {
        const dStats = statsPorDisc[disc];
        const item = document.createElement('div');
        item.className = 'accordion-item';
        
        // Header (Disciplina)
        const header = document.createElement('div');
        header.className = 'accordion-header';
        header.innerHTML = `
            <div class="accordion-title-group">
                <span class="accordion-title">${disc}</span>
            </div>
            <div class="chapter-stat-numbers" style="margin-right: 12px; font-size: 0.8rem;">
                <span class="cs-res tooltip" data-tooltip="Resolvidas">${dStats.resolvidas}</span>
                <span class="cs-acertos tooltip" data-tooltip="Acertos"><i class="ph ph-check"></i> ${dStats.acertos}</span>
                <span class="cs-erros tooltip" data-tooltip="Erros"><i class="ph ph-x"></i> ${dStats.erros}</span>
            </div>
            <i class="ph ph-caret-down accordion-icon"></i>
        `;
        
        // Body (Conteúdos)
        const body = document.createElement('div');
        body.className = 'accordion-body';
        
        const bodyInner = document.createElement('div');
        bodyInner.className = 'accordion-body-inner';
        
        const conteudos = Object.keys(dStats.conteudos).sort();
        conteudos.forEach(cap => {
            const cStats = dStats.conteudos[cap];
            const capItem = document.createElement('div');
            capItem.className = 'chapter-stat-item';
            capItem.innerHTML = `
                <div class="chapter-stat-name tooltip" data-tooltip="${cap}">${cap}</div>
                <div class="chapter-stat-numbers">
                    <span class="cs-res tooltip" data-tooltip="Resolvidas">${cStats.resolvidas}</span>
                    <span class="cs-acertos tooltip" data-tooltip="Acertos"><i class="ph ph-check"></i> ${cStats.acertos}</span>
                    <span class="cs-erros tooltip" data-tooltip="Erros"><i class="ph ph-x"></i> ${cStats.erros}</span>
                </div>
            `;
            bodyInner.appendChild(capItem);
        });
        
        body.appendChild(bodyInner);
        
        // Funcionalidade do Accordion
        header.addEventListener('click', () => {
            item.classList.toggle('active');
            if (item.classList.contains('active')) {
                body.style.maxHeight = body.scrollHeight + "px";
            } else {
                body.style.maxHeight = null;
            }
        });
        
        item.appendChild(header);
        item.appendChild(body);
        container.appendChild(item);
    });
}

function atualizarTelaDashboard() {
    document.getElementById('stat-total-resolvidas').textContent = stats.totalResolvidas;
    document.getElementById('stat-total-acertos').textContent = stats.totalAcertos;
    document.getElementById('stat-total-erros').textContent = stats.totalErros;
    calcularEstatisticasPorCapitulo();
}

function atualizarHeaderStats() {
    document.getElementById('header-acertos').textContent = stats.totalAcertos;
    document.getElementById('header-erros').textContent = stats.totalErros;
    
    let taxa = 0;
    if (stats.totalResolvidas > 0) {
        taxa = Math.round((stats.totalAcertos / stats.totalResolvidas) * 100);
    }
    document.getElementById('header-taxa').textContent = taxa + '%';
}

function zerarEstatisticas() {
    if(confirm('Tem certeza que deseja zerar todo o seu histórico? Esta ação não pode ser desfeita.')) {
        // Zera os contadores gerais
        stats = { totalResolvidas: 0, totalAcertos: 0, totalErros: 0 };
        // Zera o histórico por questão (usado para os capítulos)
        historicoQuestoes = {};
        localStorage.removeItem('pcpr_history');
        
        salvarEstatisticas(); // Isso já chama atualizarTelaDashboard()
    }
}

// NAVEGAÇÃO
function showView(viewName) {
    Object.values(views).forEach(v => v.classList.remove('active'));
    views[viewName].classList.add('active');
}

// FLUXO DO SIMULADO
function configurarEventos() {
    document.getElementById('config-form').addEventListener('submit', iniciarSimulado);
    document.getElementById('btn-voltar').addEventListener('click', () => showView('dashboard'));
    document.getElementById('btn-finalizar-quiz').addEventListener('click', finalizarSimulado);
    document.getElementById('btn-proxima').addEventListener('click', proximaQuestao);
    
    document.getElementById('disciplina-select').addEventListener('change', atualizarFiltroConteudo);
    
    document.getElementById('btn-voltar-dashboard').addEventListener('click', () => showView('dashboard'));
    document.getElementById('btn-reset-stats').addEventListener('click', zerarEstatisticas);
    document.getElementById('btn-responder').addEventListener('click', verificarResposta);
    
    document.getElementById('btn-anterior').addEventListener('click', questaoAnterior);
    document.getElementById('btn-feedback-anterior').addEventListener('click', questaoAnterior);
    
    const chkTodas = document.getElementById('chk-qtd-todas');
    const inputQtd = document.getElementById('qtd-questoes-input');
    
    if (chkTodas && inputQtd) {
        chkTodas.addEventListener('change', (e) => {
            inputQtd.disabled = e.target.checked;
        });
    }
    
    document.getElementById('btn-favorite').addEventListener('click', toggleFavorite);
    document.getElementById('btn-save-comment').addEventListener('click', salvarAnotacaoQuestao);
    
    const chkOcultar = document.getElementById('filtro-ocultar-respondidas');
    const chkErros = document.getElementById('filtro-apenas-erros');
    
    chkOcultar.addEventListener('change', (e) => {
        if(e.target.checked) chkErros.checked = false;
    });
    
    chkErros.addEventListener('change', (e) => {
        if(e.target.checked) chkOcultar.checked = false;
    });
}

function atualizarFiltroConteudo() {
    const disciplinaSelecionada = document.getElementById('disciplina-select').value;
    const selectConteudo = document.getElementById('conteudo-select');
    
    // Pega as questões da disciplina selecionada
    let questoesDisciplina = bancoQuestoes.filter(q => q.disciplina === disciplinaSelecionada);
    
    // Pega todos os conteúdos únicos
    const conteudos = [...new Set(questoesDisciplina.map(q => q.conteudo))];
    
    // Atualiza a opção 'Todos' com o total da disciplina
    selectConteudo.innerHTML = `<option value="todos" selected>Todos os conteúdos (${questoesDisciplina.length})</option>`;
    
    // Ordena os conteúdos alfabeticamente/numericamente e adiciona o contador
    conteudos.sort().forEach(cont => {
        const totalConteudo = questoesDisciplina.filter(q => q.conteudo === cont).length;
        const option = document.createElement('option');
        option.value = cont;
        option.textContent = `${cont} (${totalConteudo})`;
        selectConteudo.appendChild(option);
    });
    
    selectConteudo.disabled = false;
}

function iniciarSimulado(e) {
    e.preventDefault();
    
    const disciplina = document.getElementById('disciplina-select').value;
    const conteudo = document.getElementById('conteudo-select').value;
    const apenasFavoritas = document.getElementById('filtro-favoritas').checked;
    const ocultarRespondidas = document.getElementById('filtro-ocultar-respondidas').checked;
    const apenasErros = document.getElementById('filtro-apenas-erros').checked;
    
    const chkTodas = document.getElementById('chk-qtd-todas').checked;
    const inputQtdValue = document.getElementById('qtd-questoes-input').value;
    
    if (!disciplina) return alert("Selecione uma disciplina!");

    // Filtrar questões
    let questoesFiltradas = bancoQuestoes.filter(q => q.disciplina === disciplina);
    
    if (conteudo !== 'todos') {
        questoesFiltradas = questoesFiltradas.filter(q => q.conteudo === conteudo);
    }
    
    if (apenasFavoritas) {
        questoesFiltradas = questoesFiltradas.filter(q => favoritos.includes(q.id));
        if (questoesFiltradas.length === 0) {
            return alert("Nenhuma questão favoritada encontrada com os filtros atuais.");
        }
    }
    
    if (ocultarRespondidas) {
        questoesFiltradas = questoesFiltradas.filter(q => !historicoQuestoes[q.id]);
        if (questoesFiltradas.length === 0) {
            return alert("Você já respondeu a todas as questões desta seleção. Tente remover o filtro ou escolher outra disciplina.");
        }
    }
    
    if (apenasErros) {
        questoesFiltradas = questoesFiltradas.filter(q => {
            const h = historicoQuestoes[q.id];
            return h === 'erro' || (h && h.status === 'erro');
        });
        if (questoesFiltradas.length === 0) {
            return alert("Nenhuma questão com erro encontrada para esta seleção.");
        }
    }
    
    // Embaralhar
    questoesFiltradas.sort(() => Math.random() - 0.5);

    // Definir quantidade
    let qtd = chkTodas ? questoesFiltradas.length : parseInt(inputQtdValue);
    if (isNaN(qtd) || qtd < 1) qtd = 10; // Fallback
    
    // Pegar subarray
    simuladoAtual = questoesFiltradas.slice(0, qtd);
    
    if (simuladoAtual.length === 0) {
        return alert("Nenhuma questão encontrada para esta disciplina.");
    }

    // Resetar variáveis de estado
    questaoAtualIndex = 0;
    acertosSimulado = 0;
    errosSimulado = 0;
    
    document.getElementById('quiz-disciplina-badge').textContent = disciplina;
    
    carregarQuestaoUI();
    showView('quiz');
}

function carregarQuestaoUI() {
    const q = simuladoAtual[questaoAtualIndex];
    
    // Header do Quiz
    document.getElementById('current-question-indicator').textContent = `Questão ${questaoAtualIndex + 1} de ${simuladoAtual.length}`;
    
    const percent = ((questaoAtualIndex) / simuladoAtual.length) * 100;
    document.getElementById('progress-bar-fill').style.width = `${percent}%`;

    // Reset Botões Responder e Anterior
    const btnResponder = document.getElementById('btn-responder');
    btnResponder.disabled = true;
    btnResponder.style.display = 'block';
    
    const btnAnterior = document.getElementById('btn-anterior');
    const btnFeedbackAnterior = document.getElementById('btn-feedback-anterior');
    
    if (questaoAtualIndex > 0) {
        btnAnterior.style.display = 'flex';
        btnFeedbackAnterior.style.display = 'flex';
    } else {
        btnAnterior.style.display = 'none';
        btnFeedbackAnterior.style.display = 'none';
    }

    // Meta Dados
    document.getElementById('q-capitulo').textContent = q.capitulo;
    document.getElementById('q-id').textContent = `ID: ${q.id}`;
    
    // Tentativas
    let histAtual = historicoQuestoes[q.id];
    let tentativas = 0;
    if (typeof histAtual === 'string') {
        tentativas = 1;
    } else if (histAtual && histAtual.tentativas) {
        tentativas = histAtual.tentativas;
    }
    
    const spanTentativas = document.getElementById('q-tentativas');
    if (tentativas > 0) {
        spanTentativas.innerHTML = `<i class="ph ph-arrows-clockwise"></i> Resolvida: ${tentativas}x`;
        spanTentativas.style.display = 'inline-block';
    } else {
        spanTentativas.style.display = 'none';
    }
    
    // Favoritos e Comentários
    const btnFav = document.getElementById('btn-favorite');
    if (favoritos.includes(q.id)) {
        btnFav.classList.add('active');
        btnFav.innerHTML = '<i class="ph-fill ph-star"></i>';
    } else {
        btnFav.classList.remove('active');
        btnFav.innerHTML = '<i class="ph ph-star"></i>';
    }
    
    const commentBox = document.getElementById('q-comment');
    commentBox.value = comentarios[q.id] || '';
    document.getElementById('comment-status').classList.remove('show');
    
    // Enunciado
    document.getElementById('q-enunciado').textContent = q.enunciado;
    
    // Alternativas
    const container = document.getElementById('q-alternativas');
    container.innerHTML = ''; // limpar
    
    if (q.tipo === 'multipla_escolha') {
        const letras = ['A', 'B', 'C', 'D', 'E'];
        letras.forEach(letra => {
            if (q.alternativas[letra]) {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.innerHTML = `
                    <span class="option-letter">${letra}</span>
                    <span class="option-text">${q.alternativas[letra]}</span>
                `;
                // Como não sabemos a lógica exata do HTML da letra correta na verificação, setamos um dataset
                btn.dataset.valor = letra;
                btn.onclick = () => selecionarOpcao(btn);
                btn.ondblclick = (e) => alternarRisco(e, btn);
                container.appendChild(btn);
            }
        });
    } else if (q.tipo === 'certo_errado') {
        const opcoes = ['Certo', 'Errado'];
        opcoes.forEach(opcao => {
            const btn = document.createElement('button');
            btn.className = 'option-btn ce-btn';
            btn.innerHTML = `<span class="option-text" style="font-weight:600; text-align:center; width: 100%;">${opcao}</span>`;
            btn.dataset.valor = opcao;
            btn.onclick = () => selecionarOpcao(btn);
            btn.ondblclick = (e) => alternarRisco(e, btn);
            container.appendChild(btn);
        });
    }

    // Ocultar feedback por padrão
    document.getElementById('feedback-panel').classList.add('hidden');
    
    // Restaurar estado se já respondida neste simulado
    if (q.foi_respondida_neste_simulado) {
        const botoes = document.querySelectorAll('.option-btn');
        const btnSelecionado = Array.from(botoes).find(b => b.dataset.valor === q.letra_escolhida_neste_simulado);
        
        botoes.forEach(b => b.disabled = true);
        btnResponder.style.display = 'none';
        
        if (btnSelecionado) {
            btnSelecionado.classList.add('selected');
            if (q.acertou_neste_simulado) {
                btnSelecionado.classList.add('correct');
            } else {
                btnSelecionado.classList.add('wrong');
                const btnCorreto = Array.from(botoes).find(b => b.dataset.valor === q.resposta_correta);
                if (btnCorreto) btnCorreto.classList.add('correct');
            }
        }
        mostrarFeedback(q, q.acertou_neste_simulado);
    }
    
    // Rolar para o topo
    window.scrollTo(0, 0);
}

function selecionarOpcao(btnClicado) {
    // Se os botões já estão desabilitados (após responder), não faz nada
    if (btnClicado.disabled) return;
    
    // Se o botão estiver riscado, remover o risco para poder selecionar
    if (btnClicado.classList.contains('crossed-out')) {
        btnClicado.classList.remove('crossed-out');
    }
    
    const botoes = document.querySelectorAll('.option-btn');
    botoes.forEach(b => b.classList.remove('selected'));
    
    btnClicado.classList.add('selected');
    document.getElementById('btn-responder').disabled = false;
}

function alternarRisco(e, btnClicado) {
    // Previne comportamento padrão
    e.preventDefault();
    if (btnClicado.disabled) return;
    
    // Alternar classe de risco
    btnClicado.classList.toggle('crossed-out');
    
    // Se acabou de ser riscado, deve perder a seleção
    if (btnClicado.classList.contains('crossed-out')) {
        btnClicado.classList.remove('selected');
        
        // Verifica se há algum outro botão selecionado para gerenciar o botão responder
        const selecionada = document.querySelector('.option-btn.selected');
        if (!selecionada) {
            document.getElementById('btn-responder').disabled = true;
        }
    }
}

function verificarResposta() {
    const q = simuladoAtual[questaoAtualIndex];
    const correta = q.resposta_correta;
    
    const botoes = document.querySelectorAll('.option-btn');
    const btnClicado = Array.from(botoes).find(b => b.classList.contains('selected'));
    
    if (!btnClicado) return;
    
    const letraEscolhida = btnClicado.dataset.valor;
    
    // Desabilitar todos os botões, remover riscos e ocultar o botão Responder
    botoes.forEach(b => {
        b.disabled = true;
        b.classList.remove('crossed-out');
    });
    document.getElementById('btn-responder').style.display = 'none';
    
    const isAcerto = letraEscolhida === correta;
    
    // Salvar estado na sessão atual
    q.foi_respondida_neste_simulado = true;
    q.letra_escolhida_neste_simulado = letraEscolhida;
    q.acertou_neste_simulado = isAcerto;
    
    // Migrar formato antigo ou inicializar novo
    let histAtual = historicoQuestoes[q.id];
    if (typeof histAtual === 'string') {
        histAtual = { status: histAtual, tentativas: 1 };
    } else if (!histAtual) {
        histAtual = { status: '', tentativas: 0 };
    }
    
    histAtual.status = isAcerto ? 'acerto' : 'erro';
    histAtual.tentativas += 1;
    
    historicoQuestoes[q.id] = histAtual;
    salvarHistorico();
    
    // Atualizar Estatísticas Locais
    stats.totalResolvidas++;
    if (isAcerto) {
        stats.totalAcertos++;
        acertosSimulado++;
        btnClicado.classList.add('correct');
    } else {
        stats.totalErros++;
        errosSimulado++;
        btnClicado.classList.add('wrong');
        
        // Destacar a correta
        const botoesArray = Array.from(botoes);
        const btnCorreto = botoesArray.find(b => b.dataset.valor === correta);
        if(btnCorreto) btnCorreto.classList.add('correct');
    }
    
    salvarEstatisticas();
    
    // Mostrar feedback
    mostrarFeedback(q, isAcerto);
}

function mostrarFeedback(q, isAcerto) {
    const panel = document.getElementById('feedback-panel');
    const title = document.getElementById('feedback-title');
    
    panel.classList.remove('hidden', 'correct', 'wrong');
    
    if (isAcerto) {
        panel.classList.add('correct');
        title.innerHTML = '<i class="ph ph-check-circle"></i> Resposta Correta!';
    } else {
        panel.classList.add('wrong');
        title.innerHTML = '<i class="ph ph-x-circle"></i> Resposta Incorreta';
    }
    
    document.getElementById('feedback-gabarito').textContent = `Gabarito: ${q.resposta_correta}`;
    document.getElementById('feedback-justificativa').textContent = q.justificativa;
    document.getElementById('feedback-referencia').textContent = q.referencia;
    
    // Mudar texto do botão se for a última
    const btnProx = document.getElementById('btn-proxima');
    if (questaoAtualIndex === simuladoAtual.length - 1) {
        btnProx.innerHTML = 'Ver Resultado <i class="ph ph-flag-checkered"></i>';
    } else {
        btnProx.innerHTML = 'Próxima Questão <i class="ph ph-arrow-right"></i>';
    }
}

function proximaQuestao() {
    questaoAtualIndex++;
    if (questaoAtualIndex < simuladoAtual.length) {
        carregarQuestaoUI();
    } else {
        finalizarSimulado();
    }
}

function questaoAnterior() {
    if (questaoAtualIndex > 0) {
        questaoAtualIndex--;
        carregarQuestaoUI();
    }
}

function finalizarSimulado() {
    const total = questaoAtualIndex + (document.getElementById('feedback-panel').classList.contains('hidden') ? 0 : 1);
    
    // Se saiu antes de responder nada
    if (total === 0) {
        showView('dashboard');
        return;
    }

    // Configurar tela de resultado
    document.getElementById('result-acertos').textContent = acertosSimulado;
    document.getElementById('result-erros').textContent = errosSimulado;
    document.getElementById('result-total').textContent = acertosSimulado + errosSimulado;
    
    const porcentagem = Math.round((acertosSimulado / (acertosSimulado + errosSimulado)) * 100) || 0;
    
    document.getElementById('result-percentage').textContent = `${porcentagem}%`;
    
    const circle = document.getElementById('result-circle-path');
    
    // Define a cor do gráfico baseado na nota
    let color = 'var(--error-color)';
    if (porcentagem >= 70) color = 'var(--success-color)';
    else if (porcentagem >= 50) color = 'var(--warning-color)';
    
    circle.style.stroke = color;
    circle.setAttribute('stroke-dasharray', `${porcentagem}, 100`);
    
    showView('result');
}

function toggleFavorite(e) {
    e.preventDefault();
    const q = simuladoAtual[questaoAtualIndex];
    const btnFav = document.getElementById('btn-favorite');
    
    const index = favoritos.indexOf(q.id);
    if (index > -1) {
        favoritos.splice(index, 1);
        btnFav.classList.remove('active');
        btnFav.innerHTML = '<i class="ph ph-star"></i>';
    } else {
        favoritos.push(q.id);
        btnFav.classList.add('active');
        btnFav.innerHTML = '<i class="ph-fill ph-star"></i>';
    }
    salvarFavoritos();
}

function salvarAnotacaoQuestao(e) {
    e.preventDefault();
    const q = simuladoAtual[questaoAtualIndex];
    const texto = document.getElementById('q-comment').value.trim();
    
    if (texto) {
        comentarios[q.id] = texto;
    } else {
        delete comentarios[q.id];
    }
    salvarComentarios();
    
    const statusMsg = document.getElementById('comment-status');
    statusMsg.textContent = "Anotação salva!";
    statusMsg.classList.add('show');
    
    setTimeout(() => {
        statusMsg.classList.remove('show');
    }, 2000);
}

// ==========================================
// CONTROLE DE AVANÇO DO CURSO
// ==========================================

const planoEducacional = [
    { id: "at", nome: "ARMAMENTO E TIRO (AT)", horas: 90, aulas: 45 },
    { id: "apc", nome: "ATIVIDADE POLICIAL EM CAMPO (APC)", horas: 16, aulas: 8 },
    { id: "bbdf", nome: "BIOMETRIA E BANCOS DE DADOS FORENSES (BBDF)", horas: 20, aulas: 10 },
    { id: "cri", nome: "CRIMINALÍSTICA (CRI)", horas: 36, aulas: 18 },
    { id: "dpp", nome: "DEFESA PESSOAL POLICIAL (DPP)", horas: 14, aulas: 14 },
    { id: "do", nome: "DIREÇÃO OPERACIONAL (DO)", horas: 10, aulas: 5 },
    { id: "doc", nome: "DOCUMENTOSCOPIA (DOC)", horas: 30, aulas: 15 },
    { id: "if", nome: "INFORMÁTICA FORENSE (IF)", horas: 24, aulas: 12 },
    { id: "isdc", nome: "INTELIGÊNCIA SOCIOEMOCIONAL E DIVERSIDADE CULTURAL (ISDC)", horas: 22, aulas: 11 },
    { id: "ipo", nome: "INVESTIGAÇÃO POLICIAL (IPO)", horas: 48, aulas: 24 },
    { id: "jec", nome: "JORNADA ESPECÍFICA DE CRIMINALÍSTICA (JEC)", horas: 42, aulas: 21 },
    { id: "loc", nome: "LOCAIS DE CRIME E SUAS INTERFACES (LOC)", horas: 68, aulas: 34 },
    { id: "pvat", nome: "PERÍCIA EM VEÍCULOS E ACIDENTES DE TRÁFEGO (PVAT)", horas: 22, aulas: 11 },
    { id: "pproc", nome: "PERÍCIA EM PRODUTOS E CONTRATAÇÕES (PPROC)", horas: 24, aulas: 12 },
    { id: "ppcexb", nome: "PERÍCIAS EM PRODUTOS CONTROLADOS, EXPLOSIVOS E BALÍSTICA (PPCEXB)", horas: 34, aulas: 17 },
    { id: "sop", nome: "SOCORRISMO POLICIAL (SOP)", horas: 16, aulas: 8 },
    { id: "to", nome: "TÉCNICAS OPERACIONAIS (TO)", horas: 44, aulas: 22 },
    { id: "teap", nome: "TÓPICOS ESPECIALIZADOS DA ATIVIDADE POLICIAL (TEAP)", horas: 34, aulas: 17 },
    { id: "tfp", nome: "TREINAMENTO FÍSICO POLICIAL (TFP)", horas: 14, aulas: 14 }
].sort((a, b) => b.horas - a.horas);

let progressoCurso = {};

function carregarControleCurso() {
    const saved = localStorage.getItem('pcpr_course_progress');
    if (saved) {
        progressoCurso = JSON.parse(saved);
    } else {
        // Inicializa zerado
        planoEducacional.forEach(disc => {
            progressoCurso[disc.id] = new Array(disc.aulas).fill(false);
        });
        salvarProgressoCurso();
    }
    
    renderizarGridControle();
}

function salvarProgressoCurso() {
    localStorage.setItem('pcpr_course_progress', JSON.stringify(progressoCurso));
    requestCloudSync();
}

function renderizarGridControle() {
    const container = document.getElementById('disciplines-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    planoEducacional.forEach(disc => {
        const card = document.createElement('div');
        card.className = 'discipline-card';
        
        const progressoAtual = progressoCurso[disc.id] || new Array(disc.aulas).fill(false);
        const aulasDadas = progressoAtual.filter(p => p === true).length;
        const percent = Math.round((aulasDadas / disc.aulas) * 100);
        
        card.innerHTML = `
            <div class="discipline-card-header">
                <div class="discipline-title">${disc.nome}</div>
                <div class="discipline-stats">${disc.horas} h/a</div>
            </div>
            <div class="discipline-progress-container">
                <div class="discipline-progress-info">
                    <span class="progress-text" id="prog-text-${disc.id}">${aulasDadas} / ${disc.aulas} Aulas</span>
                    <span class="discipline-percentage" id="prog-percent-${disc.id}">${percent}%</span>
                </div>
                <div class="discipline-progress-bar">
                    <div class="discipline-progress-fill" id="prog-fill-${disc.id}" style="width: ${percent}%;"></div>
                </div>
            </div>
            <div class="class-boxes" id="boxes-${disc.id}">
                <!-- Checkboxes gerados no loop abaixo -->
            </div>
        `;
        
        container.appendChild(card);
        
        const boxesContainer = document.getElementById(`boxes-${disc.id}`);
        for (let i = 0; i < disc.aulas; i++) {
            const box = document.createElement('div');
            box.className = 'class-box';
            if (progressoAtual[i]) box.classList.add('checked');
            
            box.innerHTML = '<i class="ph ph-check"></i>';
            box.title = `Aula ${i + 1}`;
            
            box.onclick = () => alternarAula(disc.id, i, box);
            
            boxesContainer.appendChild(box);
        }
    });
    
    atualizarProgressoGeral();
}

function alternarAula(discId, aulaIndex, boxElement) {
    // Verifica se o array já foi inicializado (caso adicionemos mais depois)
    if (!progressoCurso[discId]) {
        const disc = planoEducacional.find(d => d.id === discId);
        progressoCurso[discId] = new Array(disc.aulas).fill(false);
    }
    
    const arr = progressoCurso[discId];
    
    // Inverte o estado
    arr[aulaIndex] = !arr[aulaIndex];
    
    // Atualiza interface
    if (arr[aulaIndex]) {
        boxElement.classList.add('checked');
    } else {
        boxElement.classList.remove('checked');
    }
    
    // Atualiza texto e barra
    const aulasDadas = arr.filter(p => p === true).length;
    const discInfo = planoEducacional.find(d => d.id === discId);
    const percent = Math.round((aulasDadas / discInfo.aulas) * 100);
    
    document.getElementById(`prog-text-${discId}`).textContent = `${aulasDadas} / ${discInfo.aulas} Aulas`;
    document.getElementById(`prog-percent-${discId}`).textContent = `${percent}%`;
    document.getElementById(`prog-fill-${discId}`).style.width = `${percent}%`;
    
    // Salva localmente
    salvarProgressoCurso();
    
    // Atualiza barra global
    atualizarProgressoGeral();
}

function atualizarProgressoGeral() {
    let totalAulas = 0;
    let aulasDadas = 0;
    
    planoEducacional.forEach(disc => {
        totalAulas += disc.aulas;
        const progressoAtual = progressoCurso[disc.id] || [];
        aulasDadas += progressoAtual.filter(p => p === true).length;
    });
    
    const percent = totalAulas > 0 ? Math.round((aulasDadas / totalAulas) * 100) : 0;
    
    const textEl = document.getElementById('global-prog-text');
    const percentEl = document.getElementById('global-prog-percent');
    const fillEl = document.getElementById('global-prog-fill');
    
    if (textEl) textEl.textContent = `${aulasDadas} / ${totalAulas} Aulas no Total (Progresso Geral)`;
    if (percentEl) percentEl.textContent = `${percent}%`;
    if (fillEl) fillEl.style.width = `${percent}%`;
}

function switchMainTab(tabName) {
    const tabSimulador = document.getElementById('tab-simulador');
    const tabControle = document.getElementById('tab-controle');
    const tabMaterial = document.getElementById('tab-material');
    
    if (tabSimulador) tabSimulador.classList.remove('active');
    if (tabControle) tabControle.classList.remove('active');
    if (tabMaterial) tabMaterial.classList.remove('active');
    
    if (tabName === 'simulador') {
        if (tabSimulador) tabSimulador.classList.add('active');
        showView('dashboard');
    } else if (tabName === 'controle') {
        if (tabControle) tabControle.classList.add('active');
        showView('control-view');
    } else if (tabName === 'material') {
        if (tabMaterial) tabMaterial.classList.add('active');
        showView('material-view');
    }
}

// ==========================================
// CONTROLE DE MATERIAIS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const matDisc = document.getElementById('material-disciplina-select');
    const matCap = document.getElementById('material-capitulo-select');
    const iframeContainer = document.querySelector('.material-reader-container');
    const iframe = document.getElementById('material-iframe');
    const statusMsg = document.getElementById('material-loading-status');
    
    const materialData = {
        'criminalistica': { path: 'CRIMINALISTICA', maxCaps: 17 },
        'ipo': { path: 'IPO', maxCaps: 9 }
    };
    
    if(matDisc) {
        matDisc.addEventListener('change', () => {
            const disc = materialData[matDisc.value];
            matCap.innerHTML = '<option value="" disabled selected>Selecione o capítulo</option>';
            
            if(disc) {
                for(let i = 1; i <= disc.maxCaps; i++) {
                    const num = i.toString().padStart(2, '0');
                    const opt = document.createElement('option');
                    opt.value = `Capitulo_${num}.html`;
                    opt.textContent = `Capítulo ${i}`;
                    matCap.appendChild(opt);
                }
                matCap.disabled = false;
            }
        });
        
        matCap.addEventListener('change', () => {
            if(!matDisc.value || !matCap.value) return;
            const folder = materialData[matDisc.value].path;
            const fileName = matCap.value;
            const url = `materiais/${folder}/HTML/${fileName}`;
            
            iframeContainer.style.display = 'block';
            statusMsg.style.display = 'inline-block';
            iframe.style.opacity = '0.4';
            
            // Força o iframe a ficar pequeno para não herdar a altura gigante do capítulo anterior
            iframe.style.height = '200px';
            // Reseta a referência do último tamanho conhecido
            iframe.dataset.lastHeight = '0';
            
            iframe.onload = () => {
                statusMsg.style.display = 'none';
                iframe.style.opacity = '1';
            };
            
            iframe.src = url;
        });
    }

    // Ouve mensagens dos HTMLs carregados para ajustar a altura dinamicamente sem barra de rolagem
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'resize-iframe') {
            if (iframeContainer.style.display !== 'none') {
                const newHeight = event.data.height;
                const lastHeight = parseInt(iframe.dataset.lastHeight || '0');
                
                // Previne o loop infinito de crescimento:
                // Só ajusta a altura do iframe se a diferença de tamanho for significativa (> 30px)
                if (Math.abs(newHeight - lastHeight) > 30) {
                    iframe.dataset.lastHeight = newHeight.toString();
                    iframe.style.height = (newHeight + 20) + 'px';
                }
            }
        }
    });
});
