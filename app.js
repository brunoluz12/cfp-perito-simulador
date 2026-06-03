// ==========================================
// TEMA (modo escuro / claro)
// ==========================================
// O tema inicial já é aplicado no <head> via inline script,
// para evitar "flash" de tema claro ao abrir no modo escuro.
function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark-mode');
    try {
        localStorage.setItem('pcpr_theme', isDark ? 'dark' : 'light');
    } catch (e) {}
}

// VARIÁVEIS GLOBAIS
let bancoQuestoes = [];

// Ordenação natural: Cap. 1, Cap. 2, ..., Cap. 10 (e não Cap. 1, Cap. 10, Cap. 2)
function naturalSort(a, b) {
    return a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' });
}

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
    'material-view': document.getElementById('material-view'),
    'agenda-view': document.getElementById('agenda-view'),
    'psico-view': document.getElementById('psico-view'),
    'admin-view': document.getElementById('admin-view')
};

// VARIÁVEIS DE NUVEM
let currentUser = null;
let syncTimeout = null;
let isAdmin = false;
const ADMIN_USER = 'brunoluz12';

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
    const pendingMsg = document.getElementById('login-pending-msg');
    const blockedMsg = document.getElementById('login-blocked-msg');
    const btn = document.getElementById('btn-login');
    
    // Esconder mensagens anteriores
    pendingMsg.classList.add('hidden');
    blockedMsg.classList.add('hidden');
    statusMsg.classList.remove('hidden');
    btn.disabled = true;
    
    // Verificar acesso via API (só funciona na Vercel)
    try {
        const authResponse = await fetch(`/api/auth?username=${encodeURIComponent(user)}`);
        if (authResponse.ok) {
            const authResult = await authResponse.json();
            
            if (authResult.status === 'pending') {
                statusMsg.classList.add('hidden');
                pendingMsg.classList.remove('hidden');
                btn.disabled = false;
                return; // Não permite login
            }
            
            if (authResult.status === 'blocked') {
                statusMsg.classList.add('hidden');
                blockedMsg.classList.remove('hidden');
                btn.disabled = false;
                return; // Não permite login
            }
            
            // Se é admin, marcar flag
            if (authResult.isAdmin) {
                isAdmin = true;
            }
        }
    } catch (e) {
        // API não disponível (uso local) — permite login sem controle
        console.warn("API de autenticação não disponível. Acesso local sem controle.");
        // Se é o admin em acesso local, habilitar admin
        if (user.toLowerCase().trim() === ADMIN_USER) {
            isAdmin = true;
        }
    }
    
    // Login aprovado — limpar dados do usuário anterior se for diferente
    const previousUser = localStorage.getItem('pcpr_current_user');
    if (previousUser && previousUser.toLowerCase().trim() !== user.toLowerCase().trim()) {
        // Usuário diferente: limpar todos os dados locais para não vazar dados
        localStorage.removeItem('pcpr_stats');
        localStorage.removeItem('pcpr_favorites');
        localStorage.removeItem('pcpr_comments');
        localStorage.removeItem('pcpr_history');
        localStorage.removeItem('pcpr_course_progress');
        localStorage.removeItem('pcpr_agenda_aplicada');
        localStorage.removeItem('pcpr_material_studied');
    }
    
    // Carregar dados da nuvem
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
                if (result.data.agendaAplicada) localStorage.setItem('pcpr_agenda_aplicada', JSON.stringify(result.data.agendaAplicada));
                if (result.data.materialEstudado) localStorage.setItem('pcpr_material_studied', JSON.stringify(result.data.materialEstudado));
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
    
    // Mostrar aba Admin se for admin
    if (isAdmin) {
        const tabAdmin = document.getElementById('tab-admin');
        const tabAdminDivider = document.getElementById('admin-tab-divider');
        if (tabAdmin) tabAdmin.style.display = '';
        if (tabAdminDivider) tabAdminDivider.style.display = '';
        carregarUsuariosAdmin(); // Carrega badge de pendentes
    }
    
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
        let agendaAplicada = {};
        try { agendaAplicada = JSON.parse(localStorage.getItem('pcpr_agenda_aplicada') || '{}'); } catch (e) {}
        const payload = {
            stats: stats,
            favoritos: favoritos,
            comentarios: comentarios,
            historico: historicoQuestoes,
            progresso: progressoCurso,
            agendaAplicada: agendaAplicada,
            materialEstudado: materialEstudado
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

// ==========================================
// COMPONENTE MULTI-SELECT
// ==========================================
class MultiSelect {
    constructor(rootEl, opts = {}) {
        this.root = rootEl;
        this.trigger = rootEl.querySelector('.multi-select-trigger');
        this.label = rootEl.querySelector('.multi-select-label');
        this.dropdown = rootEl.querySelector('.multi-select-dropdown');
        this.optionsContainer = rootEl.querySelector('.multi-select-options');
        this.placeholder = opts.placeholder || 'Selecionar...';
        this.allLabel = opts.allLabel || 'Todos selecionados';
        this.onChange = opts.onChange || (() => {});
        this.options = [];
        this.selected = new Set();
        this._bind();
    }

    _bind() {
        this.trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
        document.addEventListener('click', (e) => {
            if (!this.root.contains(e.target)) this.close();
        });
        this.root.querySelectorAll('.multi-select-actions button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (btn.dataset.action === 'all') this.selectAll();
                else if (btn.dataset.action === 'none') this.selectNone();
            });
        });
    }

    setOptions(opts) {
        this.options = opts;
        // Mantém apenas seleções que ainda existem nas novas opções
        const valid = new Set(opts.map(o => o.value));
        for (const v of [...this.selected]) {
            if (!valid.has(v)) this.selected.delete(v);
        }
        this._renderOptions();
        this._updateLabel();
    }

    _renderOptions() {
        this.optionsContainer.innerHTML = '';
        if (this.options.length === 0) {
            this.optionsContainer.innerHTML = '<div class="multi-select-empty">Nenhuma opção disponível</div>';
            return;
        }
        this.options.forEach(opt => {
            const label = document.createElement('label');
            label.className = 'multi-select-option';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = opt.value;
            cb.checked = this.selected.has(opt.value);
            const txt = document.createElement('span');
            txt.className = 'opt-text';
            txt.textContent = opt.label;
            label.appendChild(cb);
            label.appendChild(txt);
            if (opt.count != null) {
                const c = document.createElement('span');
                c.className = 'opt-count';
                c.textContent = opt.count;
                label.appendChild(c);
            }
            cb.addEventListener('change', () => {
                if (cb.checked) this.selected.add(opt.value);
                else this.selected.delete(opt.value);
                this._updateLabel();
                this.onChange(this.getSelected());
            });
            this.optionsContainer.appendChild(label);
        });
    }

    _updateLabel() {
        const n = this.selected.size;
        const total = this.options.length;
        if (total === 0) {
            this.label.textContent = this.placeholder;
            this.label.classList.add('is-placeholder');
        } else if (n === 0) {
            this.label.textContent = this.placeholder;
            this.label.classList.add('is-placeholder');
        } else if (n === total) {
            this.label.textContent = this.allLabel;
            this.label.classList.remove('is-placeholder');
        } else if (n === 1) {
            const v = [...this.selected][0];
            const opt = this.options.find(o => o.value === v);
            this.label.textContent = opt ? opt.label : v;
            this.label.classList.remove('is-placeholder');
        } else {
            this.label.textContent = `${n} selecionado(s)`;
            this.label.classList.remove('is-placeholder');
        }
    }

    getSelected() { return [...this.selected]; }

    selectAll() {
        this.options.forEach(o => this.selected.add(o.value));
        this._syncCheckboxes();
        this._updateLabel();
        this.onChange(this.getSelected());
    }
    selectNone() {
        this.selected.clear();
        this._syncCheckboxes();
        this._updateLabel();
        this.onChange(this.getSelected());
    }
    _syncCheckboxes() {
        this.optionsContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = this.selected.has(cb.value);
        });
    }
    open() { this.root.classList.add('is-open'); }
    close() { this.root.classList.remove('is-open'); }
    toggle() {
        if (this.trigger.disabled) return;
        this.root.classList.toggle('is-open');
    }
    setDisabled(disabled) {
        this.trigger.disabled = disabled;
        if (disabled) this.close();
    }
}

let msDisciplina = null;
let msConteudo = null;

// CARREGAMENTO DE DADOS
function carregarBancoQuestoes() {
    try {
        if (typeof questoesDB === 'undefined') {
            throw new Error('Variável questoesDB não encontrada. Verifique se o banco_questoes.js está correto.');
        }

        bancoQuestoes = questoesDB;

        // Extrai disciplinas únicas (ordenadas)
        const disciplinas = [...new Set(bancoQuestoes.map(q => q.disciplina))].sort();

        // Inicializa Multi-Selects
        msDisciplina = new MultiSelect(document.getElementById('ms-disciplina'), {
            placeholder: 'Selecione disciplinas...',
            allLabel: 'Todas as disciplinas',
            onChange: () => atualizarFiltroConteudo()
        });
        msConteudo = new MultiSelect(document.getElementById('ms-conteudo'), {
            placeholder: 'Todos (ou selecione específicos)',
            allLabel: 'Todos os conteúdos'
        });

        msDisciplina.setOptions(disciplinas.map(d => ({
            value: d,
            label: d,
            count: bancoQuestoes.filter(q => q.disciplina === d).length
        })));

        // Habilita botões
        document.getElementById('btn-start').disabled = false;
        const btnSim = document.getElementById('btn-open-simulado');
        if (btnSim) btnSim.disabled = false;
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

    // Conta TODAS as questões do banco (total + status)
    bancoQuestoes.forEach(q => {
        const disc = q.disciplina || "Sem Disciplina";
        const cap = q.conteudo || q.capitulo || "Geral";

        if (!statsPorDisc[disc]) {
            statsPorDisc[disc] = { total: 0, resolvidas: 0, acertos: 0, erros: 0, conteudos: {} };
        }
        if (!statsPorDisc[disc].conteudos[cap]) {
            statsPorDisc[disc].conteudos[cap] = { total: 0, resolvidas: 0, acertos: 0, erros: 0 };
        }

        // Total (sempre incrementa - é o universo do banco)
        statsPorDisc[disc].total++;
        statsPorDisc[disc].conteudos[cap].total++;

        // Resolvidas/acertos/erros — só se tiver histórico
        const hist = historicoQuestoes[q.id];
        if (hist && hist.status) {
            statsPorDisc[disc].resolvidas++;
            statsPorDisc[disc].conteudos[cap].resolvidas++;
            if (hist.status === 'acerto') {
                statsPorDisc[disc].acertos++;
                statsPorDisc[disc].conteudos[cap].acertos++;
            } else if (hist.status === 'erro') {
                statsPorDisc[disc].erros++;
                statsPorDisc[disc].conteudos[cap].erros++;
            }
        }
    });

    const disciplinas = Object.keys(statsPorDisc).sort();

    if (disciplinas.length === 0) {
        container.innerHTML = '<p class="empty-stats-msg">Carregue o banco de questões para ver os indicadores.</p>';
        return;
    }

    container.innerHTML = '';

    disciplinas.forEach(disc => {
        const dStats = statsPorDisc[disc];
        const pendentes = dStats.total - dStats.resolvidas;
        const pctResolvido = dStats.total > 0 ? Math.round((dStats.resolvidas / dStats.total) * 100) : 0;
        const taxaAcerto = dStats.resolvidas > 0 ? Math.round((dStats.acertos / dStats.resolvidas) * 100) : 0;

        const item = document.createElement('div');
        item.className = 'accordion-item';

        // Header da Disciplina
        const header = document.createElement('div');
        header.className = 'accordion-header';
        header.innerHTML = `
            <div class="accordion-title-group">
                <span class="accordion-title">${disc}</span>
                <div class="progress-mini">
                    <div class="progress-mini-bar"><div class="progress-mini-fill" style="width: ${pctResolvido}%;"></div></div>
                    <span class="progress-mini-text">${dStats.resolvidas}/${dStats.total}</span>
                </div>
            </div>
            <div class="chapter-stat-numbers">
                <span class="cs-pct tooltip" data-tooltip="Taxa de Acerto">${taxaAcerto}%</span>
                <span class="cs-acertos tooltip" data-tooltip="Acertos"><i class="ph ph-check"></i> ${dStats.acertos}</span>
                <span class="cs-erros tooltip" data-tooltip="Erros"><i class="ph ph-x"></i> ${dStats.erros}</span>
                <span class="cs-pend tooltip" data-tooltip="Faltam responder"><i class="ph ph-hourglass-medium"></i> ${pendentes}</span>
            </div>
            <i class="ph ph-caret-down accordion-icon"></i>
        `;

        // Body (Conteúdos)
        const body = document.createElement('div');
        body.className = 'accordion-body';

        const bodyInner = document.createElement('div');
        bodyInner.className = 'accordion-body-inner';

        const conteudos = Object.keys(dStats.conteudos).sort(naturalSort);
        conteudos.forEach(cap => {
            const cStats = dStats.conteudos[cap];
            const cPend = cStats.total - cStats.resolvidas;
            const cPctRes = cStats.total > 0 ? Math.round((cStats.resolvidas / cStats.total) * 100) : 0;
            const cTaxa = cStats.resolvidas > 0 ? Math.round((cStats.acertos / cStats.resolvidas) * 100) : 0;

            const capItem = document.createElement('div');
            capItem.className = 'chapter-stat-item';
            capItem.innerHTML = `
                <div class="chapter-stat-content">
                    <div class="chapter-stat-name tooltip" data-tooltip="${cap}">${cap}</div>
                    <div class="progress-mini">
                        <div class="progress-mini-bar"><div class="progress-mini-fill" style="width: ${cPctRes}%;"></div></div>
                        <span class="progress-mini-text">${cStats.resolvidas}/${cStats.total}</span>
                    </div>
                </div>
                <div class="chapter-stat-numbers">
                    <span class="cs-pct tooltip" data-tooltip="Taxa de Acerto">${cTaxa}%</span>
                    <span class="cs-acertos tooltip" data-tooltip="Acertos"><i class="ph ph-check"></i> ${cStats.acertos}</span>
                    <span class="cs-erros tooltip" data-tooltip="Erros"><i class="ph ph-x"></i> ${cStats.erros}</span>
                    <span class="cs-pend tooltip" data-tooltip="Faltam responder"><i class="ph ph-hourglass-medium"></i> ${cPend}</span>
                </div>
            `;
            bodyInner.appendChild(capItem);
        });

        body.appendChild(bodyInner);

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

    // Novos indicadores: total no banco, faltam, taxa
    const totalBanco = Array.isArray(bancoQuestoes) ? bancoQuestoes.length : 0;
    const faltam = Math.max(0, totalBanco - stats.totalResolvidas);
    const taxa = (stats.totalAcertos + stats.totalErros) > 0
        ? Math.round((stats.totalAcertos / (stats.totalAcertos + stats.totalErros)) * 100)
        : 0;

    const elFaltam = document.getElementById('stat-total-faltam');
    const elBanco = document.getElementById('stat-total-banco');
    const elTaxa = document.getElementById('stat-total-taxa');
    if (elFaltam) elFaltam.textContent = faltam;
    if (elBanco) elBanco.textContent = totalBanco;
    if (elTaxa) elTaxa.textContent = `${taxa}%`;

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
    document.getElementById('config-form').addEventListener('submit', gerarCaderno);
    
    // Busca por ID
    const btnBuscaId = document.getElementById('btn-busca-id');
    const inputBuscaId = document.getElementById('busca-id-input');
    if (btnBuscaId && inputBuscaId) {
        const handleBuscaId = () => {
            const idInput = inputBuscaId.value.trim();
            if (!idInput) return;
            const idNum = parseInt(idInput, 10);
            const questao = bancoQuestoes.find(q => q.id === idNum);
            if (!questao) {
                alert(`Questão com ID ${idNum} não encontrada no banco de dados.`);
                return;
            }
            
            simuladoAtual = [questao];
            questaoAtualIndex = 0;
            acertosSimulado = 0;
            errosSimulado = 0;
            showView('quiz');
            carregarQuestaoUI();
            inputBuscaId.value = ''; // limpa após buscar
        };
        
        btnBuscaId.addEventListener('click', handleBuscaId);
        inputBuscaId.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleBuscaId();
            }
        });
    }
    document.getElementById('btn-voltar').addEventListener('click', () => showView('dashboard'));
    document.getElementById('btn-finalizar-quiz').addEventListener('click', finalizarSimulado);
    document.getElementById('btn-proxima').addEventListener('click', proximaQuestao);

    // Botões do modal "Gerar Simulado"
    const btnOpenSim = document.getElementById('btn-open-simulado');
    if (btnOpenSim) btnOpenSim.addEventListener('click', abrirModalSimulado);
    const btnSimClose = document.getElementById('simulado-modal-close');
    if (btnSimClose) btnSimClose.addEventListener('click', fecharModalSimulado);
    const btnSimCancel = document.getElementById('btn-sim-cancel');
    if (btnSimCancel) btnSimCancel.addEventListener('click', fecharModalSimulado);
    const btnSimGenerate = document.getElementById('btn-sim-generate');
    if (btnSimGenerate) btnSimGenerate.addEventListener('click', gerarSimuladoModal);
    const simTotal = document.getElementById('sim-total-input');
    if (simTotal) simTotal.addEventListener('input', atualizarResumoSimulado);
    const overlay = document.getElementById('simulado-modal');
    if (overlay) overlay.addEventListener('click', (e) => {
        if (e.target === overlay) fecharModalSimulado();
    });

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
    if (!msDisciplina || !msConteudo) return;
    const disciplinas = msDisciplina.getSelected();
    if (disciplinas.length === 0) {
        msConteudo.setOptions([]);
        msConteudo.setDisabled(true);
        return;
    }
    msConteudo.setDisabled(false);
    const questoes = bancoQuestoes.filter(q => disciplinas.includes(q.disciplina));
    const conteudos = [...new Set(questoes.map(q => q.conteudo))].sort(naturalSort);
    msConteudo.setOptions(conteudos.map(c => ({
        value: c,
        label: c,
        count: questoes.filter(q => q.conteudo === c).length
    })));
}

// ==========================================
// MODAL "GERAR SIMULADO" (multi-disciplina/conteúdo com qtd por conteúdo)
// ==========================================
let msSimDisciplina = null;

function abrirModalSimulado() {
    const overlay = document.getElementById('simulado-modal');
    if (!overlay) return;
    inicializarMultiSelectSimulado();
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    atualizarResumoSimulado();
}

function fecharModalSimulado() {
    const overlay = document.getElementById('simulado-modal');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
}

function inicializarMultiSelectSimulado() {
    if (msSimDisciplina) {
        // Já inicializado: apenas reseta seleções para abertura limpa
        msSimDisciplina.selectNone();
        renderizarArvoreSimulado([]);
        return;
    }
    const root = document.getElementById('ms-sim-disciplina');
    if (!root) return;
    msSimDisciplina = new MultiSelect(root, {
        placeholder: 'Selecione disciplinas...',
        allLabel: 'Todas as disciplinas',
        onChange: (selecionadas) => renderizarArvoreSimulado(selecionadas)
    });
    const disciplinas = [...new Set(bancoQuestoes.map(q => q.disciplina))].sort();
    msSimDisciplina.setOptions(disciplinas.map(d => ({
        value: d,
        label: d,
        count: bancoQuestoes.filter(q => q.disciplina === d).length
    })));
}

function renderizarArvoreSimulado(disciplinasSelecionadas) {
    const tree = document.getElementById('simulado-tree');
    if (!tree) return;
    tree.innerHTML = '';

    if (!disciplinasSelecionadas || disciplinasSelecionadas.length === 0) {
        tree.innerHTML = '<div class="multi-select-empty" style="padding: 30px;">Selecione uma ou mais disciplinas acima para configurar os conteúdos.</div>';
        atualizarResumoSimulado();
        return;
    }

    disciplinasSelecionadas.sort().forEach(disc => {
        const conteudos = [...new Set(
            bancoQuestoes.filter(q => q.disciplina === disc).map(q => q.conteudo)
        )].sort(naturalSort);

        const group = document.createElement('div');
        group.className = 'discipline-group';

        const header = document.createElement('div');
        header.className = 'discipline-group-header';

        const title = document.createElement('span');
        title.className = 'disc-title';
        title.textContent = disc;

        const actions = document.createElement('div');
        actions.className = 'disc-actions';
        const btnAll = document.createElement('button');
        btnAll.type = 'button';
        btnAll.dataset.grpAction = 'all';
        btnAll.textContent = 'Todos';
        const btnNone = document.createElement('button');
        btnNone.type = 'button';
        btnNone.dataset.grpAction = 'none';
        btnNone.textContent = 'Nenhum';
        actions.appendChild(btnAll);
        actions.appendChild(btnNone);

        const caret = document.createElement('i');
        caret.className = 'ph ph-caret-down';

        header.appendChild(title);
        header.appendChild(actions);
        header.appendChild(caret);

        // Toggle collapse ao clicar fora dos botões/título da actions
        header.addEventListener('click', (e) => {
            if (e.target.closest('.disc-actions')) return;
            group.classList.toggle('is-collapsed');
        });

        // Handlers dos botões "Todos / Nenhum" do grupo
        actions.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            e.stopPropagation();
            const action = btn.dataset.grpAction;
            const rows = body.querySelectorAll('.conteudo-row');
            rows.forEach(r => {
                const cb = r.querySelector('.sim-cb');
                const qty = r.querySelector('.sim-qty');
                const max = parseInt(r.dataset.max, 10);
                if (action === 'all') {
                    cb.checked = true;
                    qty.disabled = false;
                    if (parseInt(qty.value, 10) === 0) qty.value = Math.min(5, max);
                    r.classList.add('is-selected');
                } else {
                    cb.checked = false;
                    qty.disabled = true;
                    qty.value = '0';
                    r.classList.remove('is-selected');
                }
            });
            atualizarResumoSimulado();
        });

        group.appendChild(header);

        const body = document.createElement('div');
        body.className = 'discipline-group-body';

        conteudos.forEach(cont => {
            const total = bancoQuestoes.filter(q => q.disciplina === disc && q.conteudo === cont).length;
            const row = document.createElement('div');
            row.className = 'conteudo-row';
            row.dataset.disciplina = disc;
            row.dataset.conteudo = cont;
            row.dataset.max = total;

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.className = 'sim-cb';

            const lbl = document.createElement('div');
            lbl.className = 'conteudo-label';
            const lblText = document.createElement('span');
            lblText.textContent = cont;
            const lblAvail = document.createElement('span');
            lblAvail.className = 'conteudo-available';
            lblAvail.textContent = `(${total} disponíveis)`;
            lbl.appendChild(lblText);
            lbl.appendChild(lblAvail);

            const qty = document.createElement('input');
            qty.type = 'number';
            qty.min = '0';
            qty.max = String(total);
            qty.value = '0';
            qty.className = 'sim-qty';
            qty.disabled = true;

            cb.addEventListener('change', () => {
                qty.disabled = !cb.checked;
                if (cb.checked) {
                    row.classList.add('is-selected');
                    if (parseInt(qty.value, 10) === 0) qty.value = Math.min(5, total);
                } else {
                    row.classList.remove('is-selected');
                    qty.value = '0';
                }
                atualizarResumoSimulado();
            });

            qty.addEventListener('input', () => {
                let v = parseInt(qty.value, 10);
                if (isNaN(v) || v < 0) v = 0;
                if (v > total) v = total;
                qty.value = String(v);
                atualizarResumoSimulado();
            });

            row.appendChild(cb);
            row.appendChild(lbl);
            row.appendChild(qty);
            body.appendChild(row);
        });

        group.appendChild(body);
        tree.appendChild(group);
    });

    atualizarResumoSimulado();
}

function atualizarResumoSimulado() {
    const target = parseInt(document.getElementById('sim-total-input').value, 10) || 0;
    document.getElementById('sim-target').textContent = target;

    const rows = document.querySelectorAll('#simulado-tree .conteudo-row');
    let soma = 0;
    rows.forEach(r => {
        const cb = r.querySelector('.sim-cb');
        const qty = r.querySelector('.sim-qty');
        if (cb.checked) soma += parseInt(qty.value, 10) || 0;
    });

    const sumEl = document.getElementById('sim-sum');
    sumEl.textContent = soma;

    const summary = document.getElementById('simulado-summary');
    const btnGen = document.getElementById('btn-sim-generate');
    const valido = soma > 0 && soma === target;
    summary.classList.toggle('is-error', !valido && soma > 0);
    btnGen.disabled = !valido;
}

function gerarSimuladoModal() {
    const rows = document.querySelectorAll('#simulado-tree .conteudo-row');
    const buckets = [];
    rows.forEach(r => {
        const cb = r.querySelector('.sim-cb');
        if (!cb.checked) return;
        const qty = parseInt(r.querySelector('.sim-qty').value, 10) || 0;
        if (qty <= 0) return;
        buckets.push({
            disciplina: r.dataset.disciplina,
            conteudo: r.dataset.conteudo,
            qty
        });
    });
    if (buckets.length === 0) return alert("Selecione ao menos um conteúdo com quantidade > 0.");

    // Para cada bucket, sorteia N questões aleatórias
    const todasSorteadas = [];
    for (const b of buckets) {
        const pool = bancoQuestoes
            .filter(q => q.disciplina === b.disciplina && q.conteudo === b.conteudo)
            .slice();
        pool.sort(() => Math.random() - 0.5);
        todasSorteadas.push(...pool.slice(0, b.qty));
    }

    // Embaralha o agregado final para misturar disciplinas
    todasSorteadas.sort(() => Math.random() - 0.5);

    if (todasSorteadas.length === 0) {
        return alert("Não foi possível gerar o simulado com os parâmetros escolhidos.");
    }

    simuladoAtual = todasSorteadas;
    questaoAtualIndex = 0;
    acertosSimulado = 0;
    errosSimulado = 0;

    const disciplinasUsadas = [...new Set(buckets.map(b => b.disciplina))];
    document.getElementById('quiz-disciplina-badge').textContent =
        disciplinasUsadas.length === 1 ? disciplinasUsadas[0] : `${disciplinasUsadas.length} disciplinas`;

    fecharModalSimulado();
    carregarQuestaoUI();
    showView('quiz');
}

function gerarCaderno(e) {
    if (e) e.preventDefault();

    const disciplinas = msDisciplina ? msDisciplina.getSelected() : [];
    const conteudosSelecionados = msConteudo ? msConteudo.getSelected() : [];
    const apenasFavoritas = document.getElementById('filtro-favoritas').checked;
    const ocultarRespondidas = document.getElementById('filtro-ocultar-respondidas').checked;
    const apenasErros = document.getElementById('filtro-apenas-erros').checked;

    const chkTodas = document.getElementById('chk-qtd-todas').checked;
    const inputQtdValue = document.getElementById('qtd-questoes-input').value;

    if (disciplinas.length === 0) return alert("Selecione pelo menos uma disciplina!");

    // Filtra por disciplina(s)
    let questoesFiltradas = bancoQuestoes.filter(q => disciplinas.includes(q.disciplina));

    // Se algum conteúdo foi selecionado, filtra por eles. Se nenhum, considera todos.
    if (conteudosSelecionados.length > 0) {
        questoesFiltradas = questoesFiltradas.filter(q => conteudosSelecionados.includes(q.conteudo));
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
    if (isNaN(qtd) || qtd < 1) qtd = 10;

    simuladoAtual = questoesFiltradas.slice(0, qtd);

    if (simuladoAtual.length === 0) {
        return alert("Nenhuma questão encontrada para esta seleção.");
    }

    // Resetar estado
    questaoAtualIndex = 0;
    acertosSimulado = 0;
    errosSimulado = 0;

    const badge = disciplinas.length === 1 ? disciplinas[0] : `${disciplinas.length} disciplinas`;
    document.getElementById('quiz-disciplina-badge').textContent = badge;

    carregarQuestaoUI();
    showView('quiz');
}

function carregarQuestaoUI() {
    const q = simuladoAtual[questaoAtualIndex];
    
    // Header do Quiz
    document.getElementById('current-question-indicator').textContent = `Questão ${questaoAtualIndex + 1} de ${simuladoAtual.length}`;
    
    // Badge de Conteúdo
    const badgeConteudo = document.getElementById('quiz-conteudo-badge');
    if (q.conteudo) {
        badgeConteudo.textContent = q.conteudo;
        badgeConteudo.style.display = 'inline-flex';
    } else {
        badgeConteudo.style.display = 'none';
    }
    
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

// ==========================================
// AUTO-FILL DO CONTROLE A PARTIR DA AGENDA
// ==========================================
// Mapeia o prefixo do código da aula (campo `aula` na agenda) para o id da
// disciplina em planoEducacional. Prefixos null são eventos que não contam
// no Controle (Abertura, Aula Magna, Inspeção de Estrutura do Curso, etc).
const aulaPrefixMap = {
    // Eventos (não contam no Controle)
    'AA': null, 'AMAG': null, 'IEC': null, 'EVENTOS': null, 'EVENTO': null,
    // Disciplinas regulares
    'CRI': 'cri',
    'BBDF': 'bbdf',
    'AT': 'at',
    'IPO': 'ipo',
    'IPO-MBTIP': 'ipo', 'IPO-MIPO': 'ipo', 'IPO-MMIPO': 'ipo', 'IPO-MEGI': 'ipo',
    'TEAP': 'teap',
    'PVAT': 'pvat',
    'TO': 'to',
    'SOP': 'sop',
    'DPP': 'dpp',
    'TFP': 'tfp',
    'APC': 'apc',
    'DO': 'do',
    'DOC': 'doc',
    'IF': 'if',
    'ISDC': 'isdc',
    'JEC': 'jec',
    'LOC': 'loc',
    // PDF usa nomes ligeiramente diferentes do plano educacional
    'PRO': 'pproc',     // PRO M1.0X = Perícia em Produtos e Contratações (PPROC)
    'PPROC': 'pproc',
    'PCEB': 'ppcexb',   // PCEB M1.0X = Perícias em Produtos Controlados, Explosivos e Balística
    'PPCEXB': 'ppcexb'
};

// Devolve a LISTA de ids de disciplinas (em planoEducacional) a partir do
// código da aula. Retorna [] para eventos ou códigos desconhecidos.
// Casos especiais:
//   - "DPP/TFP M1.02 (2P, 2M)" representa uma aula combinada que conta
//     UMA aula de DPP E UMA aula de TFP (1h de cada, consecutivas).
//   - Códigos não mapeados (logados no console em dev) retornam [].
function getDisciplineIdsFromAula(aulaStr) {
    if (!aulaStr || typeof aulaStr !== 'string') return [];
    const head = aulaStr.split(/[\s\-(]/)[0].trim().toUpperCase();
    // Aula combinada DPP+TFP
    if (head === 'DPP/TFP' || head === 'TFP/DPP') return ['dpp', 'tfp'];
    if (!(head in aulaPrefixMap)) return [];
    const v = aulaPrefixMap[head];
    return v ? [v] : [];
}

// Marca automaticamente como concluídas todas as aulas da agenda cuja data
// já é hoje ou anterior. Mantém o controle de quais já foram aplicadas em
// `pcpr_agenda_aplicada` para não interferir em desmarcações manuais
// posteriores (se o usuário desmarcou uma aula, ela não é re-marcada).
//
// A contagem é cumulativa por disciplina e cronológica (importante porque
// uma disciplina como IPO ou CRI tem vários módulos cujos contadores
// internos zeram a cada módulo — o que vale é a posição global no curso).
function aplicarAutoFillAgenda() {
    if (typeof agendaDados === 'undefined' || !agendaDados.pautas || !agendaDados.pautas.pcf) return;

    let aplicada = {};
    try {
        aplicada = JSON.parse(localStorage.getItem('pcpr_agenda_aplicada') || '{}');
    } catch (e) { aplicada = {}; }

    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999); // Inclui o dia inteiro de hoje

    // Coleta todas as aulas em ordem cronológica (data + ordem no dia)
    const todasAulas = [];
    Object.entries(agendaDados.pautas.pcf).forEach(([mesId, dias]) => {
        const parts = mesId.split('-');
        if (parts.length !== 2) return;
        const mesNum = parseInt(parts[0], 10);
        const anoNum = parseInt(parts[1], 10);
        if (!mesNum || !anoNum) return;
        dias.forEach(dia => {
            const diaNum = parseInt(dia.dia, 10);
            if (!diaNum) return;
            const data = new Date(anoNum, mesNum - 1, diaNum);
            (dia.blocos || []).forEach((bloco, ordem) => {
                todasAulas.push({ data, ordem, aula: bloco.aula });
            });
        });
    });
    todasAulas.sort((a, b) => (a.data - b.data) || (a.ordem - b.ordem));

    // Conta cumulativamente por disciplina, só até hoje (inclusive).
    // Uma aula pode contar para mais de uma disciplina (caso DPP/TFP).
    const targetCounts = {};
    todasAulas.forEach(item => {
        if (item.data > hoje) return;
        const discIds = getDisciplineIdsFromAula(item.aula);
        discIds.forEach(discId => {
            targetCounts[discId] = (targetCounts[discId] || 0) + 1;
        });
    });

    // Aplica incrementalmente: só marca aulas que ainda não haviam sido
    // automarcadas em execuções anteriores. Assim, se o usuário desmarcou
    // alguma aula manualmente, ela permanece desmarcada.
    let mudou = false;
    Object.entries(targetCounts).forEach(([discId, target]) => {
        const disc = planoEducacional.find(d => d.id === discId);
        if (!disc) return;
        if (!progressoCurso[discId]) {
            progressoCurso[discId] = new Array(disc.aulas).fill(false);
        }
        const jaAplicado = aplicada[discId] || 0;
        if (target <= jaAplicado) return;
        const limite = Math.min(target, disc.aulas);
        for (let i = jaAplicado; i < limite; i++) {
            if (!progressoCurso[discId][i]) {
                progressoCurso[discId][i] = true;
                mudou = true;
            }
        }
        aplicada[discId] = limite;
    });

    localStorage.setItem('pcpr_agenda_aplicada', JSON.stringify(aplicada));
    if (mudou) salvarProgressoCurso();
}

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

    aplicarAutoFillAgenda();
    renderizarGridControle();
    configurarBotaoAtualizarControle();
}

// Re-executa o auto-fill da agenda manualmente. Útil quando o usuário
// quer marcar as aulas que aconteceram hoje sem precisar fechar/abrir o app.
function atualizarControleAgora() {
    aplicarAutoFillAgenda();
    renderizarGridControle();

    // Feedback visual no próprio botão
    const btn = document.getElementById('btn-atualizar-controle');
    if (!btn || btn.dataset.busy === '1') return;
    btn.dataset.busy = '1';
    const html = btn.innerHTML;
    btn.innerHTML = '<i class="ph ph-check"></i> Atualizado';
    setTimeout(() => {
        btn.innerHTML = html;
        delete btn.dataset.busy;
    }, 1500);
}

function configurarBotaoAtualizarControle() {
    const btn = document.getElementById('btn-atualizar-controle');
    if (!btn || btn.dataset.bound === '1') return;
    btn.addEventListener('click', atualizarControleAgora);
    btn.dataset.bound = '1';
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
    const tabAgenda = document.getElementById('tab-agenda');
    const tabPsico = document.getElementById('tab-psico');
    const tabAdmin = document.getElementById('tab-admin');
    
    if (tabSimulador) tabSimulador.classList.remove('active');
    if (tabControle) tabControle.classList.remove('active');
    if (tabMaterial) tabMaterial.classList.remove('active');
    if (tabAgenda) tabAgenda.classList.remove('active');
    if (tabPsico) tabPsico.classList.remove('active');
    if (tabAdmin) tabAdmin.classList.remove('active');
    
    if (tabName === 'simulador') {
        if (tabSimulador) tabSimulador.classList.add('active');
        showView('dashboard');
    } else if (tabName === 'controle') {
        if (tabControle) tabControle.classList.add('active');
        showView('control-view');
    } else if (tabName === 'material') {
        if (tabMaterial) tabMaterial.classList.add('active');
        showView('material-view');
    } else if (tabName === 'agenda') {
        if (tabAgenda) tabAgenda.classList.add('active');
        showView('agenda-view');
    } else if (tabName === 'psico') {
        if (tabPsico) tabPsico.classList.add('active');
        showView('psico-view');
    } else if (tabName === 'admin') {
        if (tabAdmin) tabAdmin.classList.add('active');
        showView('admin-view');
        carregarUsuariosAdmin();
    }
}

// ==========================================
// CONTROLE DE MATERIAIS
// ==========================================
let materialEstudado = {};

function carregarMaterialEstudado() {
    try {
        materialEstudado = JSON.parse(localStorage.getItem('pcpr_material_studied') || '{}');
    } catch (e) {
        materialEstudado = {};
    }
}

function salvarMaterialEstudado() {
    localStorage.setItem('pcpr_material_studied', JSON.stringify(materialEstudado));
    requestCloudSync();
}

function getMaterialKey(disciplina, capituloFile) {
    return `${disciplina}::${capituloFile}`;
}

function atualizarEstiloOpcoes(selectElement, disciplina) {
    const options = selectElement.querySelectorAll('option');
    options.forEach(opt => {
        if (opt.value && !opt.disabled) {
            const key = getMaterialKey(disciplina, opt.value);
            if (materialEstudado[key]) {
                opt.style.color = '#10b981';
                opt.style.fontWeight = '600';
                // Adiciona checkmark ao texto se não tiver ainda
                if (!opt.textContent.startsWith('✅ ')) {
                    opt.textContent = '✅ ' + opt.textContent;
                }
            } else {
                opt.style.color = '';
                opt.style.fontWeight = '';
                opt.textContent = opt.textContent.replace(/^✅ /, '');
            }
        }
    });
}

function atualizarBotaoEstudado(disciplina, capituloFile) {
    const btnEstudado = document.getElementById('btn-marcar-estudado');
    const btnLabel = document.getElementById('btn-estudado-label');
    if (!btnEstudado || !btnLabel) return;

    const key = getMaterialKey(disciplina, capituloFile);
    btnEstudado.style.display = 'inline-flex';

    if (materialEstudado[key]) {
        btnLabel.textContent = 'Estudado ✔';
        btnEstudado.style.background = 'rgba(16, 185, 129, 0.15)';
        btnEstudado.style.color = '#10b981';
        btnEstudado.style.borderColor = '#10b981';
    } else {
        btnLabel.textContent = 'Marcar como Estudado';
        btnEstudado.style.background = '';
        btnEstudado.style.color = '';
        btnEstudado.style.borderColor = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const matDisc = document.getElementById('material-disciplina-select');
    const matCap = document.getElementById('material-capitulo-select');
    const iframeContainer = document.querySelector('.material-reader-container');
    const iframe = document.getElementById('material-iframe');
    const statusMsg = document.getElementById('material-loading-status');
    const btnEstudado = document.getElementById('btn-marcar-estudado');
    
    const materialData = {
        'criminalistica': {
            path: 'CRIMINALISTICA',
            capitulos: [
                'Contexto de inserção da Criminalística: A Polícia Judiciária',
                'A Criminalística – História',
                'A atuação técnica do Perito e a integração científica na investigação',
                'O Perito',
                'A prova',
                'Teoria dos vestígios',
                'Indícios',
                'Exame pericial',
                'Laudo Pericial',
                'Regulamentação internacional da Criminalística',
                'Cadeia de Custódia',
                'Gestão da Criminalística na PF e principais conceitos',
                'Normativos e boas práticas da Gestão da Criminalística',
                'Sistema Nacional de Gestão de Atividades de Criminalística (SISCRIM)',
                'Aula prática (SISCRIM)',
                'O Método científico na prática pericial',
                'Inferência lógica'
            ]
        },
        'ipo': {
            path: 'IPO',
            capitulos: [
                'Apresentação',
                'Introdução',
                'Teoria da Investigação',
                'Investigação Policial',
                'Inquérito Policial',
                'Metodologia da Investigação Policial',
                'Estratégias para Nortear a Investigação',
                'Gerenciamento das Investigações',
                'Conclusão'
            ]
        },
        'bal': {
            path: 'BAL',
            capitulos: [
                { titulo: 'Prefácio - Balística Forense', arquivo: 'Capitulo_00.html' },
                { titulo: 'Capítulo 1 - Balística: Conceituação e Divisões', arquivo: 'Capitulo_01.html' },
                { titulo: 'Capítulo 2.1 - Arma e Munição (Conceitos e Cartucho)', arquivo: 'Capitulo_02a.html' },
                { titulo: 'Capítulo 2.2 - Classificação das Armas de Fogo', arquivo: 'Capitulo_02b.html' },
                { titulo: 'Capítulo 2.3 - Calibre das Armas e Munição', arquivo: 'Capitulo_02c.html' },
                { titulo: 'Capítulo 3 - Armas Curtas (Revólver e Pistola)', arquivo: 'Capitulo_03.html' },
                { titulo: 'Capítulo 4 - Armas Longas (Rifle, Fuzil, Carabina, Espingarda)', arquivo: 'Capitulo_04.html' },
                { titulo: 'Capítulo 5 - Exames em Armas de Fogo (Resíduos, Caracteres Suprimidos)', arquivo: 'Capitulo_05.html' },
                { titulo: 'Capítulo 6 - Exames em Munição (Confronto Balístico, SINAB)', arquivo: 'Capitulo_06.html' },
                { titulo: 'Anexos - Descrições e Soluções Reveladoras', arquivo: 'Capitulo_07_Anexos.html' }
            ]
        },
        'pceb': {
            path: 'PCEB',
            capitulos: [
                { titulo: 'Introdução - Bombas e Explosivos', arquivo: 'Capitulo_00.html' },
                { titulo: 'Capítulo 1 - Contextualização (Terrorismo)', arquivo: 'Capitulo_01.html' },
                { titulo: 'Capítulo 2 - Bombas e Explosivos (Definições, Tipos, Efeitos)', arquivo: 'Capitulo_02.html' },
                { titulo: 'Capítulo 3 - Sistemas de Iniciação (Estopins, Cápsulas, Espoletas)', arquivo: 'Capitulo_03.html' },
                { titulo: 'Capítulo 4 - Mecanismos de Acionamento', arquivo: 'Capitulo_04.html' },
                { titulo: 'Capítulo 5 - Técnicas de Desativação', arquivo: 'Capitulo_05.html' },
                { titulo: 'Capítulo 6 - Bombas Postais', arquivo: 'Capitulo_06.html' },
                { titulo: 'Capítulo 7 - Inspeções de Segurança', arquivo: 'Capitulo_07.html' },
                { titulo: 'Capítulo 8 - Ameaça de Bomba (Vistoria, Plano de Segurança)', arquivo: 'Capitulo_08.html' },
                { titulo: 'Capítulo 9 - Procedimentos de Reação a Bombas', arquivo: 'Capitulo_09.html' },
                { titulo: 'Capítulo 10 - Perícia em Local de Explosão', arquivo: 'Capitulo_10.html' },
                { titulo: 'Anexos - Segurança, Queima, Resp. Civil e Legislação', arquivo: 'Capitulo_11_Anexos.html' }
            ]
        },
        'ipo_2': {
            path: 'IPO_2',
            capitulos: [
                { titulo: 'Capítulo 1 - Introdução', arquivo: 'Capitulo_01.html' },
                { titulo: 'Capítulo 2 - Ação de Obtenção de Elementos de Informação', arquivo: 'Capitulo_02.html' },
                { titulo: 'Capítulo 3.1 - Meios Ordinários: OSINT (Fontes Abertas)', arquivo: 'Capitulo_03_01.html' },
                { titulo: 'Capítulo 3.2 - Meios Ordinários: Bancos de Dados', arquivo: 'Capitulo_03_02.html' },
                { titulo: 'Capítulo 3.3 - Meios Ordinários: Análise de RIF', arquivo: 'Capitulo_03_03.html' },
                { titulo: 'Capítulo 3.4 - Meios Ordinários: Análise de Vínculos (Suíte i2)', arquivo: 'Capitulo_03_04.html' },
                { titulo: 'Capítulo 3.5 - Meios Ordinários: Ações Encobertas', arquivo: 'Capitulo_03_05.html' },
                { titulo: 'Capítulo 3.6 - Meios Ordinários: Fontes Humanas', arquivo: 'Capitulo_03_06.html' },
                { titulo: 'Capítulo 3.7-3.9 - Criminalística, Papiloscopia e Outros (RPA, CFTV, Rastreadores)', arquivo: 'Capitulo_03_07a09.html' },
                { titulo: 'Capítulo 4 - Formalização dos Dados (IPJ, Auto Circunstanciado)', arquivo: 'Capitulo_04.html' },
                { titulo: 'Capítulo 5 - Meios Extraordinários: Introdução', arquivo: 'Capitulo_05_intro.html' },
                { titulo: 'Capítulo 5.5.1.1 - Afastamento do Sigilo Bancário', arquivo: 'Capitulo_05_01_1.html' },
                { titulo: 'Capítulo 5.5.1.2 - Análise de Dados Bancários', arquivo: 'Capitulo_05_01_2.html' },
                { titulo: 'Capítulo 5.5.1.3 - Análise de Dados Cambiais', arquivo: 'Capitulo_05_01_3.html' },
                { titulo: 'Capítulo 5.5.1.4 - Análise de Ativos Virtuais', arquivo: 'Capitulo_05_01_4.html' },
                { titulo: 'Capítulo 5.5.1.5/6 - Outros Dados Financeiros e Fintechs', arquivo: 'Capitulo_05_01_5.html' },
                { titulo: 'Capítulo 5.5.2 - Afastamento do Sigilo Fiscal', arquivo: 'Capitulo_05_02.html' },
                { titulo: 'Capítulo 5.5.3 - Afastamento do Sigilo Telefônico', arquivo: 'Capitulo_05_03.html' },
                { titulo: 'Capítulo 5.5.4 - Afastamento do Sigilo Telemático', arquivo: 'Capitulo_05_04.html' },
                { titulo: 'Capítulo 5.5.5 - Representação por Ação Controlada', arquivo: 'Capitulo_05_05.html' },
                { titulo: 'Capítulo 5.5.6 - Infiltração Policial', arquivo: 'Capitulo_05_06.html' },
                { titulo: 'Capítulo 5.5.7 - Cooperação Internacional', arquivo: 'Capitulo_05_07a.html' },
                { titulo: 'Capítulo 5.5.8 - Compartilhamento de Provas', arquivo: 'Capitulo_05_07b.html' },
                { titulo: 'Capítulo 5.5.9 - Captação Ambiental', arquivo: 'Capitulo_05_07.html' },
                { titulo: 'Capítulo 5.5.10 - Busca e Apreensão', arquivo: 'Capitulo_05_10.html' },
                { titulo: 'Capítulo 5.5.11 - Colaboração Premiada', arquivo: 'Capitulo_05_08.html' },
                { titulo: 'Capítulo 6 - Uso da Inteligência Artificial', arquivo: 'Capitulo_06.html' },
                { titulo: 'Capítulo 7 - Apoio Institucional', arquivo: 'Capitulo_07.html' },
                { titulo: 'Capítulo 8 - Aspectos Finais', arquivo: 'Capitulo_08.html' }
            ]
        },
        'pvat_mod_1': {
            path: 'PVAT_MOD_1',
            capitulos: [
                'Introdução geral à identificação veicular',
                'Identificação veicular no Código Penal Brasileiro',
                'Evolução histórica e normativa no Brasil',
                'Classificação dos veículos',
                'Conjunto ampliado de características identificadoras',
                'Placas de Identificação Veicular (PIV)',
                'Número de Identificação Veicular (VIN)',
                'Vidros',
                'Peças com dados identificadores',
                'Processos Industriais de Gravação do VIN',
                'Tipos de Adulteração no VIN',
                'Restauração da gravação em metal',
                'Recursos utilizados na fraude de códigos identificadores',
                'Avaliação do estado de conservação do veículo',
                'Intervenções estruturais e funcionais voltadas à prática de ilícitos',
                'Sistemas para consulta',
                'Procedimento de perícia'
            ]
        },
        'pvat_mod_2': {
            path: 'PVAT_MOD_2',
            capitulos: [
                'Apresentação',
                'Contexto Atual',
                'Conceitos Fundamentais e Terminologia',
                'Legislação de Trânsito Aplicada à Perícia',
                'Física Aplicada aos Acidentes de Tráfego',
                'Análise Pericial do Local',
                'Sítios Periciais e Interpretação dos Vestígios',
                'Causas Determinantes dos Acidentes de Tráfego',
                'Casos Especiais na Perícia de Acidentes de Tráfego',
                'Documentação Pericial',
                'Método de Monte Carlo Aplicado à Perícia'
            ]
        }
    };

    carregarMaterialEstudado();

    if(matDisc) {
        matDisc.addEventListener('change', () => {
            const disc = materialData[matDisc.value];
            matCap.innerHTML = '<option value="" disabled selected>Selecione o capítulo</option>';
            btnEstudado.style.display = 'none';

            if(disc) {
                disc.capitulos.forEach((cap, idx) => {
                    const i = idx + 1;
                    const opt = document.createElement('option');
                    if (typeof cap === 'string') {
                        const num = i.toString().padStart(2, '0');
                        opt.value = `Capitulo_${num}.html`;
                        opt.textContent = `Capítulo ${i} - ${cap}`;
                    } else {
                        opt.value = cap.arquivo;
                        opt.textContent = cap.titulo;
                    }
                    matCap.appendChild(opt);
                });
                matCap.disabled = false;
                atualizarEstiloOpcoes(matCap, matDisc.value);
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
            
            // Atualiza o botão de estudado
            atualizarBotaoEstudado(matDisc.value, matCap.value);
        });
    }

    // Botão de marcar como estudado
    if (btnEstudado) {
        btnEstudado.addEventListener('click', () => {
            if (!matDisc.value || !matCap.value) return;
            const key = getMaterialKey(matDisc.value, matCap.value);

            if (materialEstudado[key]) {
                delete materialEstudado[key];
            } else {
                materialEstudado[key] = true;
            }

            salvarMaterialEstudado();
            atualizarBotaoEstudado(matDisc.value, matCap.value);
            atualizarEstiloOpcoes(matCap, matDisc.value);
        });
    }

    // Ouve mensagens dos HTMLs carregados para ajustar a altura dinamicamente sem barra de rolagem
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'resize-iframe') {
            if (iframeContainer && iframeContainer.style.display !== 'none') {
                const newHeight = event.data.height;
                const lastHeight = parseInt(iframe.dataset.lastHeight || '0');
                
                // Previne o loop infinito de crescimento:
                if (Math.abs(newHeight - lastHeight) > 30) {
                    iframe.dataset.lastHeight = newHeight.toString();
                    iframe.style.height = (newHeight + 20) + 'px';
                }
            }
        }
    });
});

// ==========================================
// CONTROLE DE AGENDA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const agendaCargo = document.getElementById('agenda-cargo-select');
    const agendaMes = document.getElementById('agenda-mes-select');
    const agendaContainer = document.getElementById('agenda-cards-container');
    const agendaCalendarContainer = document.getElementById('agenda-calendar-container');
    
    const btnList = document.getElementById('btn-view-list');
    const btnCalendar = document.getElementById('btn-view-calendar');
    
    if(!agendaCargo || typeof agendaDados === 'undefined') return;
    
    // Toggle de visões
    btnList.addEventListener('click', (e) => {
        e.preventDefault();
        btnList.classList.add('active');
        btnCalendar.classList.remove('active');
        agendaContainer.style.display = 'flex';
        agendaCalendarContainer.style.display = 'none';
    });
    
    btnCalendar.addEventListener('click', (e) => {
        e.preventDefault();
        btnCalendar.classList.add('active');
        btnList.classList.remove('active');
        agendaContainer.style.display = 'none';
        agendaCalendarContainer.style.display = 'block';
    });
    
    // Popular cargos
    agendaDados.cargos.forEach(cargo => {
        const opt = document.createElement('option');
        opt.value = cargo.id;
        opt.textContent = cargo.nome;
        agendaCargo.appendChild(opt);
    });
    
    // Popular meses
    agendaDados.meses.forEach(mes => {
        const opt = document.createElement('option');
        opt.value = mes.id;
        opt.textContent = mes.nome;
        agendaMes.appendChild(opt);
    });
    
    agendaCargo.addEventListener('change', () => {
        agendaMes.disabled = false;
        if(agendaMes.value) renderAgenda();
    });
    
    agendaMes.addEventListener('change', renderAgenda);
    
    function renderAgenda() {
        if(!agendaCargo.value || !agendaMes.value) return;
        agendaContainer.innerHTML = '';
        
        const cargoId = agendaCargo.value;
        const mesId = agendaMes.value;
        const data = agendaDados.pautas[cargoId]?.[mesId];
        
        if(!data || data.length === 0) {
            agendaContainer.innerHTML = '<div class="glass-panel" style="text-align: center; color: var(--text-muted);">Nenhuma agenda encontrada para este mês.</div>';
            agendaCalendarContainer.innerHTML = '';
            return;
        }
        
        data.forEach(dia => {
            const card = document.createElement('div');
            card.className = 'glass-panel agenda-card';
            if(dia.blocos.some(b => b.destaque)) card.classList.add('destaque');
            
            let blocosHtml = dia.blocos.map(b => `
                <div class="agenda-bloco">
                    <span class="agenda-horario"><i class="ph ph-clock"></i> ${b.horario}</span>
                    <span class="agenda-aula ${b.destaque ? 'destaque-text' : ''}">${b.aula}</span>
                </div>
            `).join('');
            
            card.innerHTML = `
                <div class="agenda-card-header">
                    <span class="dia-numero">Dia ${dia.dia}</span>
                    <span class="dia-semana">${dia.diaSemana}</span>
                </div>
                <div class="agenda-card-body">
                    ${blocosHtml}
                </div>
            `;
            
            agendaContainer.appendChild(card);
        });
        
        // Renderizar Calendário em Grade
        const [mStr, yStr] = mesId.split('-');
        const monthNum = parseInt(mStr, 10);
        const yearNum = parseInt(yStr, 10);
        
        const diasNoMes = new Date(yearNum, monthNum, 0).getDate();
        const primeiroDiaDaSemana = new Date(yearNum, monthNum - 1, 1).getDay(); // 0=Dom
        
        let calendarHtml = '<div class="calendar-grid">';
        
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        diasSemana.forEach(d => {
            calendarHtml += `<div class="calendar-header-day">${d}</div>`;
        });
        
        for (let i = 0; i < primeiroDiaDaSemana; i++) {
            calendarHtml += `<div class="calendar-day empty"></div>`;
        }
        
        for (let d = 1; d <= diasNoMes; d++) {
            const diaData = data.find(item => parseInt(item.dia, 10) === d);
            
            let classesHtml = '';
            if (diaData && diaData.blocos) {
                diaData.blocos.forEach(b => {
                    classesHtml += `
                        <div class="calendar-event ${b.destaque ? 'evento-destaque' : ''}">
                            <span class="horario">${b.horario}</span>
                            <span class="aula">${b.aula}</span>
                        </div>
                    `;
                });
            }
            
            const isDestaque = diaData && diaData.blocos.some(b => b.destaque) ? 'dia-destaque' : '';
            
            calendarHtml += `
                <div class="glass-panel calendar-day ${isDestaque}">
                    <div class="calendar-day-number">${d}</div>
                    <div class="calendar-events-container">
                        ${classesHtml}
                    </div>
                </div>
            `;
        }
        
        calendarHtml += '</div>';
        agendaCalendarContainer.innerHTML = calendarHtml;
    }
});

// ==========================================
// PAINEL DE ADMINISTRAÇÃO
// ==========================================
let adminUsers = [];
let adminSortCol = 'username';
let adminSortAsc = true;

function getAdminSortValue(u, col) {
    switch (col) {
        case 'username': return u.username.toLowerCase();
        case 'status': return u.status === 'pending' ? 0 : u.status === 'approved' ? 1 : 2;
        case 'resolvidas': return u.stats ? u.stats.totalResolvidas : 0;
        case 'acertos': return u.stats ? u.stats.totalAcertos : 0;
        case 'erros': return u.stats ? u.stats.totalErros : 0;
        case 'taxa':
            const r = u.stats ? u.stats.totalResolvidas : 0;
            const a = u.stats ? u.stats.totalAcertos : 0;
            return r > 0 ? Math.round((a / r) * 100) : 0;
        case 'solicitacao': return u.requestedAt || '';
        default: return '';
    }
}

function renderAdminTable() {
    const container = document.getElementById('admin-users-table-container');
    if (!container) return;

    if (adminUsers.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">Nenhum usuário cadastrado ainda.</p>';
        return;
    }

    // Ordenar
    const sorted = [...adminUsers].sort((a, b) => {
        const va = getAdminSortValue(a, adminSortCol);
        const vb = getAdminSortValue(b, adminSortCol);
        let cmp = 0;
        if (typeof va === 'number') {
            cmp = va - vb;
        } else {
            cmp = va.localeCompare(vb, 'pt-BR', { numeric: true });
        }
        return adminSortAsc ? cmp : -cmp;
    });

    const arrow = (col) => {
        if (adminSortCol !== col) return '<i class="ph ph-caret-up-down" style="opacity: 0.3;"></i>';
        return adminSortAsc
            ? '<i class="ph ph-caret-up" style="color: var(--primary-color);"></i>'
            : '<i class="ph ph-caret-down" style="color: var(--primary-color);"></i>';
    };

    const cols = [
        { key: 'username', label: 'Usuário' },
        { key: 'status', label: 'Status' },
        { key: 'resolvidas', label: 'Resolvidas' },
        { key: 'acertos', label: 'Acertos' },
        { key: 'erros', label: 'Erros' },
        { key: 'taxa', label: 'Taxa' },
        { key: 'solicitacao', label: 'Solicitação' }
    ];

    let html = `<table class="admin-table">
        <thead>
            <tr>
                ${cols.map(c => `<th class="sortable-th" onclick="adminSortBy('${c.key}')">${c.label} ${arrow(c.key)}</th>`).join('')}
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>`;

    sorted.forEach(u => {
        const statusClass = u.status === 'approved' ? 'status-approved' : u.status === 'blocked' ? 'status-blocked' : 'status-pending';
        const statusLabel = u.status === 'approved' ? 'Aprovado' : u.status === 'blocked' ? 'Bloqueado' : 'Pendente';
        const reqDate = u.requestedAt ? new Date(u.requestedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

        const resolvidas = u.stats ? u.stats.totalResolvidas : 0;
        const acertos = u.stats ? u.stats.totalAcertos : 0;
        const erros = u.stats ? u.stats.totalErros : 0;
        const taxa = resolvidas > 0 ? Math.round((acertos / resolvidas) * 100) : 0;

        html += `<tr>
            <td><strong>${u.username}</strong></td>
            <td><span class="admin-status-badge ${statusClass}">${statusLabel}</span></td>
            <td>${resolvidas}</td>
            <td style="color: #059669; font-weight: 600;">${acertos}</td>
            <td style="color: #dc2626; font-weight: 600;">${erros}</td>
            <td><strong>${taxa}%</strong></td>
            <td>${reqDate}</td>
            <td class="admin-actions">
                ${u.status !== 'approved' ? `<button class="btn-admin-approve" onclick="alterarStatusUsuario('${u.username}', 'approve')"><i class="ph ph-check-circle"></i> Aprovar</button>` : ''}
                ${u.status !== 'blocked' ? `<button class="btn-admin-block" onclick="alterarStatusUsuario('${u.username}', 'block')"><i class="ph ph-prohibit"></i> Bloquear</button>` : `<button class="btn-admin-approve" onclick="alterarStatusUsuario('${u.username}', 'approve')"><i class="ph ph-check-circle"></i> Desbloquear</button>`}
            </td>
        </tr>`;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function adminSortBy(col) {
    if (adminSortCol === col) {
        adminSortAsc = !adminSortAsc;
    } else {
        adminSortCol = col;
        adminSortAsc = true;
    }
    renderAdminTable();
}

async function carregarUsuariosAdmin() {
    if (!isAdmin) return;

    const container = document.getElementById('admin-users-table-container');
    if (!container) return;

    try {
        const response = await fetch('/api/admin', {
            headers: { 'X-Admin': ADMIN_USER }
        });

        if (!response.ok) {
            container.innerHTML = '<p style="color: var(--error-color);">Erro ao carregar usuários.</p>';
            return;
        }

        const data = await response.json();
        adminUsers = data.users || [];

        // Atualizar badge de pendentes
        const pendingCount = adminUsers.filter(u => u.status === 'pending').length;
        const badge = document.getElementById('admin-pending-badge');
        if (badge) {
            if (pendingCount > 0) {
                badge.textContent = pendingCount;
                badge.style.display = 'inline-flex';
            } else {
                badge.style.display = 'none';
            }
        }

        renderAdminTable();

    } catch (e) {
        console.error("Erro ao carregar admin:", e);
        container.innerHTML = '<p style="color: var(--error-color);">Erro de conexão ao carregar usuários.</p>';
    }
}

async function alterarStatusUsuario(username, action) {
    if (!isAdmin) return;

    try {
        const response = await fetch('/api/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin': ADMIN_USER
            },
            body: JSON.stringify({ username, action })
        });

        if (response.ok) {
            // Recarregar a lista
            carregarUsuariosAdmin();
        } else {
            alert('Erro ao alterar status do usuário.');
        }
    } catch (e) {
        console.error("Erro ao alterar status:", e);
        alert('Erro de conexão.');
    }
}

// Botão de atualizar no painel admin
document.addEventListener('DOMContentLoaded', () => {
    const btnRefresh = document.getElementById('btn-refresh-admin');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => carregarUsuariosAdmin());
    }
});
