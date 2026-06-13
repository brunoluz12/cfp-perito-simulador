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
let anotacoes = [];

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
    'flashcards-view': document.getElementById('flashcards-view'),
    'notes-view': document.getElementById('notes-view'),
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
        localStorage.removeItem('pcpr_flashcards');
        localStorage.removeItem('pcpr_notes');
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
                if (result.data.flashcards) {
                    localStorage.setItem('pcpr_flashcards', JSON.stringify(result.data.flashcards));
                }
                if (result.data.anotacoes) localStorage.setItem('pcpr_notes', JSON.stringify(result.data.anotacoes));
            }
        }
    } catch (e) {
        console.error("Erro ao buscar dados na nuvem. Usando dados locais como fallback.", e);
    }
    
    // Garantir que a variável em memória flashcards seja atualizada
    if (typeof loadFlashcards === 'function') loadFlashcards();
    
    currentUser = user;
    localStorage.setItem('pcpr_current_user', user);
    
    // Ocultar login e mostrar app
    document.getElementById('login-overlay').classList.add('hidden');
    document.getElementById('main-app-container').style.display = 'block';
    
    // Mostrar aba Admin se for admin
    if (isAdmin) {
        const tabAdmin = document.getElementById('tab-admin');
        if (tabAdmin) tabAdmin.style.display = '';
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
            materialEstudado: materialEstudado,
            flashcards: (typeof flashcards !== 'undefined' ? flashcards : []),
            anotacoes: anotacoes
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
        this.searchPlaceholder = opts.searchPlaceholder || 'Pesquisar...';
        this.onChange = opts.onChange || (() => {});
        this.options = [];
        this.selected = new Set();
        this.filterText = '';
        this._groupEls = new Map();
        this._buildSearch();
        this._bind();
    }

    // Campo de busca dentro do dropdown (filtra as opções conforme digita)
    _buildSearch() {
        const wrap = document.createElement('div');
        wrap.className = 'multi-select-search';
        const icon = document.createElement('i');
        icon.className = 'ph ph-magnifying-glass';
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = this.searchPlaceholder;
        input.autocomplete = 'off';
        input.addEventListener('click', (e) => e.stopPropagation());
        input.addEventListener('input', () => {
            this.filterText = input.value.trim().toLowerCase();
            this._renderOptions();
        });
        wrap.appendChild(icon);
        wrap.appendChild(input);
        this.searchInput = input;
        this.dropdown.insertBefore(wrap, this.optionsContainer);
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

    _matchesFilter(opt) {
        if (!this.filterText) return true;
        return opt.label.toLowerCase().includes(this.filterText)
            || (opt.group || '').toLowerCase().includes(this.filterText);
    }

    _criarOpcao(opt) {
        const label = document.createElement('label');
        label.className = 'multi-select-option';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = opt.value;
        cb.checked = this.selected.has(opt.value);
        if (cb.checked) label.classList.add('is-checked');
        const txt = document.createElement('span');
        txt.className = 'opt-text';
        txt.textContent = opt.label;
        label.appendChild(cb);
        label.appendChild(txt);
        if (opt.count != null) {
            const c = document.createElement('span');
            c.className = 'opt-count';
            c.textContent = opt.count;
            c.title = opt.count + ' questões';
            label.appendChild(c);
        }
        cb.addEventListener('change', () => {
            if (cb.checked) this.selected.add(opt.value);
            else this.selected.delete(opt.value);
            label.classList.toggle('is-checked', cb.checked);
            this._updateLabel();
            this._refreshGroupHeaders();
            this.onChange(this.getSelected());
        });
        return label;
    }

    _renderOptions() {
        this.optionsContainer.innerHTML = '';
        this._groupEls = new Map();

        if (this.options.length === 0) {
            this.optionsContainer.innerHTML = '<div class="multi-select-empty">Nenhuma opção disponível</div>';
            return;
        }
        const visiveis = this.options.filter(o => this._matchesFilter(o));
        if (visiveis.length === 0) {
            this.optionsContainer.innerHTML = '<div class="multi-select-empty">Nada encontrado para a busca</div>';
            return;
        }

        const grupos = [...new Set(this.options.map(o => o.group))];
        const usarGrupos = grupos.length > 1 && grupos.some(g => g != null);

        if (!usarGrupos) {
            visiveis.forEach(opt => this.optionsContainer.appendChild(this._criarOpcao(opt)));
            return;
        }

        grupos.forEach(g => {
            const visiveisDoGrupo = visiveis.filter(o => o.group === g);
            if (visiveisDoGrupo.length === 0) return;
            const todosDoGrupo = this.options.filter(o => o.group === g);

            // Cabeçalho do grupo com checkbox que marca/desmarca o grupo todo
            const header = document.createElement('div');
            header.className = 'multi-select-group-header';
            const gcb = document.createElement('input');
            gcb.type = 'checkbox';
            gcb.className = 'ms-group-cb';
            gcb.title = 'Marcar/desmarcar todos do grupo';
            gcb.addEventListener('click', (e) => e.stopPropagation());
            gcb.addEventListener('change', () => {
                const marcar = gcb.checked;
                todosDoGrupo.forEach(o => {
                    if (marcar) this.selected.add(o.value);
                    else this.selected.delete(o.value);
                });
                this._syncCheckboxes();
                this._updateLabel();
                this.onChange(this.getSelected());
            });
            const nome = document.createElement('span');
            nome.textContent = g;
            const cnt = document.createElement('span');
            cnt.className = 'opt-count';
            header.appendChild(gcb);
            header.appendChild(nome);
            header.appendChild(cnt);
            this.optionsContainer.appendChild(header);
            this._groupEls.set(g, { cb: gcb, cnt });

            visiveisDoGrupo.forEach(opt => this.optionsContainer.appendChild(this._criarOpcao(opt)));
        });

        this._refreshGroupHeaders();
    }

    _refreshGroupHeaders() {
        this._groupEls.forEach((els, g) => {
            const todos = this.options.filter(o => o.group === g);
            const sel = todos.filter(o => this.selected.has(o.value)).length;
            els.cb.checked = sel > 0 && sel === todos.length;
            els.cb.indeterminate = sel > 0 && sel < todos.length;
            els.cnt.textContent = `${sel}/${todos.length}`;
        });
    }

    _updateLabel() {
        const n = this.selected.size;
        const total = this.options.length;
        if (total === 0 || n === 0) {
            this.label.textContent = this.placeholder;
            this.label.classList.add('is-placeholder');
            return;
        }
        this.label.classList.remove('is-placeholder');
        if (n === total) {
            this.label.textContent = `${this.allLabel} (${total})`;
        } else if (n <= 2) {
            const nomes = [...this.selected].map(v => {
                const o = this.options.find(x => x.value === v);
                return o ? o.label : v;
            });
            this.label.textContent = nomes.join(' · ');
        } else {
            this.label.textContent = `${n} de ${total} selecionados`;
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
        this.optionsContainer.querySelectorAll('input[type="checkbox"]:not(.ms-group-cb)').forEach(cb => {
            cb.checked = this.selected.has(cb.value);
            const row = cb.closest('.multi-select-option');
            if (row) row.classList.toggle('is-checked', cb.checked);
        });
        this._refreshGroupHeaders();
    }
    open() {
        this.root.classList.add('is-open');
        // Limpa a busca a cada abertura, para começar sempre da lista completa
        if (this.searchInput) {
            if (this.filterText) {
                this.filterText = '';
                this.searchInput.value = '';
                this._renderOptions();
            }
            // No desktop, já deixa a busca pronta para digitar
            // (no celular evita abrir o teclado sem o usuário pedir)
            if (window.matchMedia('(min-width: 900px)').matches) {
                this.searchInput.focus();
            }
        }
    }
    close() { this.root.classList.remove('is-open'); }
    toggle() {
        if (this.trigger.disabled) return;
        if (this.root.classList.contains('is-open')) this.close();
        else this.open();
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
            searchPlaceholder: 'Pesquisar disciplina...',
            onChange: () => atualizarFiltroConteudo()
        });
        msConteudo = new MultiSelect(document.getElementById('ms-conteudo'), {
            placeholder: 'Todos (ou selecione específicos)',
            allLabel: 'Todos os conteúdos',
            searchPlaceholder: 'Pesquisar conteúdo ou disciplina...'
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

    try {
        anotacoes = JSON.parse(localStorage.getItem('pcpr_notes') || '[]');
        if (!Array.isArray(anotacoes)) anotacoes = [];
    } catch (e) { anotacoes = []; }
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

// Limpa o estado de sessão das questões selecionadas. Os objetos do banco são
// reutilizados entre cadernos — sem isso, uma questão respondida num caderno
// anterior apareceria já respondida no caderno novo.
function resetarEstadoSessao(questoes) {
    questoes.forEach(q => {
        delete q.foi_respondida_neste_simulado;
        delete q.letra_escolhida_neste_simulado;
        delete q.acertou_neste_simulado;
    });
}

// ==========================================
// PALETA DE QUESTÕES (navegação numerada do caderno)
// ==========================================
function atualizarPaleta() {
    const wrap = document.getElementById('quiz-palette');
    if (!wrap) return;
    if (!simuladoAtual || simuladoAtual.length <= 1) {
        wrap.style.display = 'none';
        return;
    }
    wrap.style.display = 'flex';

    // (Re)constrói os chips apenas quando o tamanho do caderno muda
    if (wrap.childElementCount !== simuladoAtual.length) {
        wrap.innerHTML = '';
        simuladoAtual.forEach((_, i) => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'palette-chip';
            chip.textContent = i + 1;
            chip.addEventListener('click', () => {
                questaoAtualIndex = i;
                carregarQuestaoUI();
            });
            wrap.appendChild(chip);
        });
    }

    Array.from(wrap.children).forEach((chip, i) => {
        const q = simuladoAtual[i];
        chip.classList.toggle('current', i === questaoAtualIndex);
        chip.classList.toggle('answered-correct', !!q.foi_respondida_neste_simulado && !!q.acertou_neste_simulado);
        chip.classList.toggle('answered-wrong', !!q.foi_respondida_neste_simulado && !q.acertou_neste_simulado);
    });

    const atual = wrap.children[questaoAtualIndex];
    if (atual) atual.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
}

// ==========================================
// ATALHOS DE TECLADO NO QUIZ
// A–D seleciona (C/E em certo-errado) · Enter responde/avança · ←/→ navegam
// ==========================================
function handleQuizKeydown(e) {
    const quizView = views.quiz;
    if (!quizView || !quizView.classList.contains('active')) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.ctrlKey || e.metaKey || e.altKey) return;
    // Enter com foco em botões de navegação (Voltar, Encerrar...) deixa o botão agir
    if (e.key === 'Enter' && tag === 'button' && !e.target.classList.contains('option-btn')) return;

    const q = simuladoAtual[questaoAtualIndex];
    if (!q) return;

    const feedbackVisivel = !document.getElementById('feedback-panel').classList.contains('hidden');
    const key = e.key.toUpperCase();

    if (['A', 'B', 'C', 'D', 'E'].includes(key) && e.key.length === 1) {
        let alvo = key;
        if (q.tipo === 'certo_errado') {
            alvo = key === 'C' ? 'Certo' : (key === 'E' ? 'Errado' : null);
        }
        if (!alvo) return;
        const btn = document.querySelector(`#q-alternativas .option-btn[data-valor="${alvo}"]`);
        if (btn && !btn.disabled) {
            selecionarOpcao(btn);
            e.preventDefault();
        }
    } else if (e.key === 'Enter') {
        const btnResponder = document.getElementById('btn-responder');
        if (btnResponder.style.display !== 'none' && !btnResponder.disabled) {
            verificarResposta();
            e.preventDefault();
        } else if (feedbackVisivel) {
            proximaQuestao();
            e.preventDefault();
        }
    } else if (e.key === 'ArrowLeft') {
        questaoAnterior();
    } else if (e.key === 'ArrowRight') {
        if (feedbackVisivel) proximaQuestao();
    }
}

// FLUXO DO SIMULADO
function configurarEventos() {
    document.getElementById('config-form').addEventListener('submit', gerarCaderno);
    document.addEventListener('keydown', handleQuizKeydown);
    
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
            resetarEstadoSessao(simuladoAtual);
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
    // Agrupado por disciplina: o valor carrega o par disciplina+conteúdo,
    // assim conteúdos de nome igual em disciplinas diferentes não se confundem
    const opcoes = [];
    disciplinas.slice().sort().forEach(d => {
        const qs = bancoQuestoes.filter(q => q.disciplina === d);
        [...new Set(qs.map(q => q.conteudo))].sort(naturalSort).forEach(c => {
            opcoes.push({
                value: d + '||' + c,
                label: c,
                count: qs.filter(q => q.conteudo === c).length,
                group: d
            });
        });
    });
    msConteudo.setOptions(opcoes);
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
        searchPlaceholder: 'Pesquisar disciplina...',
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
    resetarEstadoSessao(simuladoAtual);
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
    // Os valores vêm como "disciplina||conteúdo" (seleção precisa por par).
    if (conteudosSelecionados.length > 0) {
        const pares = conteudosSelecionados.map(v => {
            const sep = v.indexOf('||');
            return sep === -1 ? [null, v] : [v.slice(0, sep), v.slice(sep + 2)];
        });
        questoesFiltradas = questoesFiltradas.filter(q =>
            pares.some(([d, c]) => (d === null || q.disciplina === d) && q.conteudo === c)
        );
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
    resetarEstadoSessao(simuladoAtual);
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

    // Abre as anotações automaticamente apenas se a questão já tem comentário
    const notesDetails = document.getElementById('notes-details');
    if (notesDetails) notesDetails.open = !!comentarios[q.id];
    
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

    atualizarPaleta();

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
    atualizarPaleta();

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

    // Garante que a justificativa fique visível sem o usuário precisar rolar
    setTimeout(() => {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
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
function aplicarAutoFillAgenda(force = false) {
    if (typeof agendaDados === 'undefined' || !agendaDados.pautas || !agendaDados.pautas.pcf) return;

    let aplicada = {};
    if (!force) {
        try {
            aplicada = JSON.parse(localStorage.getItem('pcpr_agenda_aplicada') || '{}');
        } catch (e) { aplicada = {}; }
    }

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
        
        if (force || !progressoCurso[discId]) {
            progressoCurso[discId] = new Array(disc.aulas).fill(false);
            mudou = true;
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
    aplicarAutoFillAgenda(true);
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
    const tabFlashcards = document.getElementById('tab-flashcards');
    const tabNotes = document.getElementById('tab-notes');
    const tabAdmin = document.getElementById('tab-admin');

    if (tabSimulador) tabSimulador.classList.remove('active');
    if (tabControle) tabControle.classList.remove('active');
    if (tabMaterial) tabMaterial.classList.remove('active');
    if (tabAgenda) tabAgenda.classList.remove('active');
    if (tabPsico) tabPsico.classList.remove('active');
    if (tabFlashcards) tabFlashcards.classList.remove('active');
    if (tabNotes) tabNotes.classList.remove('active');
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
        if (typeof window.restaurarUltimoMaterial === 'function') window.restaurarUltimoMaterial();
    } else if (tabName === 'agenda') {
        if (tabAgenda) tabAgenda.classList.add('active');
        showView('agenda-view');
    } else if (tabName === 'psico') {
        if (tabPsico) tabPsico.classList.add('active');
        showView('psico-view');
    } else if (tabName === 'flashcards') {
        if (tabFlashcards) tabFlashcards.classList.add('active');
        showView('flashcards-view');
        if (typeof renderFlashcardDashboard === 'function') renderFlashcardDashboard();
    } else if (tabName === 'notes') {
        if (tabNotes) tabNotes.classList.add('active');
        showView('notes-view');
        if (typeof abrirAnotacoes === 'function') abrirAnotacoes();
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
        'quimica_forense': {
            path: 'QUIMICA_FORENSE',
            capitulos: [
                { titulo: 'Capítulo 1 - Conceitos Básicos sobre Química Forense', arquivo: 'Capitulo_01.html' },
                { titulo: 'Capítulo 2 - Estimulantes (Cocaína, Anfetaminas, Ecstasy)', arquivo: 'Capitulo_02.html' },
                { titulo: 'Capítulo 3 - Canabinoides (Maconha, Skunk, Haxixe)', arquivo: 'Capitulo_03.html' },
                { titulo: 'Capítulo 4 - Opioides e Sedativos/Hipnóticos', arquivo: 'Capitulo_04.html' },
                { titulo: 'Capítulo 5 - Dissociativos, Alucinógenos e Outras Drogas', arquivo: 'Capitulo_05.html' },
                { titulo: 'Capítulo 6 - Novas Substâncias Psicoativas (NSP)', arquivo: 'Capitulo_06.html' },
                { titulo: 'Capítulo 7 - Testes Preliminares e Definitivos', arquivo: 'Capitulo_07.html' },
                { titulo: 'Anexos - Apêndices (Testes Preliminares e Reagentes)', arquivo: 'Capitulo_08_Apendices.html' }
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
        },
        'loc': {
            path: 'LOC',
            capitulos: [
                'Introdução aos locais de crime',
                'Metodologia do exame de local',
                'Isolamento e preservação do local',
                'Etapas de processamento do local',
                'Documentação do local',
                'Fotografia forense - conceitos básicos',
                'Máquinas fotográficas',
                'Fotografia na prática',
                'Arquivos digitais',
                'Captura da realidade (documentação 3D)',
                'Escâneres a laser',
                'Drones (RPA) na perícia de local',
                'Vestígios e a dinâmica dos fatos',
                'Vestígios químicos',
                'Vestígios biológicos',
                'Vestígios físicos',
                'Microvestígios',
                'Locais de crime contra o patrimônio',
                'Locais de morte violenta',
                'Desastres de massa (DVI)',
                'O laudo pericial de local de crime'
            ]
        }
    };

    carregarMaterialEstudado();

    // --- Navegação entre capítulos (Anterior / Próximo) ---
    const btnCapPrev = document.getElementById('btn-cap-anterior');
    const btnCapNext = document.getElementById('btn-cap-proximo');
    const btnCapPrev2 = document.getElementById('btn-cap-anterior-2');
    const btnCapNext2 = document.getElementById('btn-cap-proximo-2');
    const readerTitle = document.getElementById('reader-cap-title');

    function navegarCapitulo(delta) {
        const opts = Array.from(matCap.options).filter(o => !o.disabled);
        const atualIdx = opts.findIndex(o => o.value === matCap.value);
        const novo = atualIdx + delta;
        if (atualIdx === -1 || novo < 0 || novo >= opts.length) return;
        matCap.value = opts[novo].value;
        matCap.dispatchEvent(new Event('change'));
    }

    function atualizarNavCapitulos() {
        const opts = Array.from(matCap.options).filter(o => !o.disabled);
        const atualIdx = opts.findIndex(o => o.value === matCap.value);
        const noInicio = atualIdx <= 0;
        const noFim = atualIdx === -1 || atualIdx >= opts.length - 1;
        [btnCapPrev, btnCapPrev2].forEach(b => { if (b) b.disabled = noInicio; });
        [btnCapNext, btnCapNext2].forEach(b => { if (b) b.disabled = noFim; });
        if (readerTitle) {
            const sel = matCap.selectedOptions[0];
            readerTitle.textContent = sel ? sel.textContent.replace(/^✅ /, '') : '';
        }
    }

    [btnCapPrev, btnCapPrev2].forEach(b => { if (b) b.addEventListener('click', () => navegarCapitulo(-1)); });
    [btnCapNext, btnCapNext2].forEach(b => { if (b) b.addEventListener('click', () => navegarCapitulo(1)); });

    // --- Continuar de onde parou: restaura o último capítulo aberto ---
    let materialRestaurado = false;
    window.restaurarUltimoMaterial = function () {
        if (materialRestaurado) return;
        materialRestaurado = true;
        if (matCap.value) return; // usuário já abriu algo nesta sessão
        let saved = null;
        try { saved = JSON.parse(localStorage.getItem('pcpr_material_last') || 'null'); } catch (e) {}
        if (!saved || !materialData[saved.disc]) return;
        matDisc.value = saved.disc;
        matDisc.dispatchEvent(new Event('change'));
        if (Array.from(matCap.options).some(o => o.value === saved.file)) {
            matCap.value = saved.file;
            matCap.dispatchEvent(new Event('change'));
        }
    };

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
                
                // Lógica de seleção de texto para flashcards
                try {
                    const doc = iframe.contentDocument || iframe.contentWindow.document;
                    doc.addEventListener('mouseup', (e) => {
                        const selection = doc.getSelection();
                        const tooltip = document.getElementById('fc-selection-tooltip');
                        
                        if (selection && selection.toString().trim().length > 0) {
                            const rect = selection.getRangeAt(0).getBoundingClientRect();
                            const iframeRect = iframe.getBoundingClientRect();
                            
                            // Calcula posição do tooltip
                            const top = iframeRect.top + rect.bottom + 10;
                            const left = iframeRect.left + rect.left + (rect.width / 2) - 50; // Centraliza aprox
                            
                            tooltip.style.top = `${top}px`;
                            tooltip.style.left = `${left}px`;
                            tooltip.style.display = 'block';
                            
                            // Guarda o texto selecionado
                            window.floatingWindowSelection = selection.toString().trim();
                        } else {
                            tooltip.style.display = 'none';
                        }
                    });
                    
                    doc.addEventListener('mousedown', () => {
                        const tooltip = document.getElementById('fc-selection-tooltip');
                        if (tooltip) tooltip.style.display = 'none';
                    });
                } catch (err) {
                    console.warn("Iframe cross-origin block para seleção de texto:", err);
                }
            };
            
            iframe.src = url;

            // Atualiza o botão de estudado
            atualizarBotaoEstudado(matDisc.value, matCap.value);

            // Navegação e título do leitor
            atualizarNavCapitulos();

            // Memoriza o último capítulo aberto ("continuar de onde parei")
            try {
                localStorage.setItem('pcpr_material_last', JSON.stringify({ disc: matDisc.value, file: matCap.value }));
            } catch (e) {}
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
    let resizeDebounce = null;
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'resize-iframe') {
            if (iframeContainer && iframeContainer.style.display !== 'none') {
                const newHeight = event.data.height;
                if (newHeight && newHeight > 50) {
                    // Debounce: espera estabilizar antes de aplicar a altura
                    clearTimeout(resizeDebounce);
                    resizeDebounce = setTimeout(() => {
                        iframe.style.height = newHeight + 'px';
                    }, 150);
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

    const hojeCardEl = document.getElementById('agenda-hoje-card');
    const resumoEl = document.getElementById('agenda-resumo');
    const btnMesPrev = document.getElementById('btn-mes-prev');
    const btnMesNext = document.getElementById('btn-mes-next');
    const btnMesHoje = document.getElementById('btn-mes-hoje');

    // --- Cores e nomes amigáveis por prefixo do código da aula ---
    const AGENDA_DISC = {
        'CRI':     { nome: 'Criminalística',                 cor: '#3b82f6' },
        'BBDF':    { nome: 'Biometria e BDs Forenses',       cor: '#06b6d4' },
        'AT':      { nome: 'Armamento e Tiro',               cor: '#ef4444' },
        'IPO':     { nome: 'Investigação Policial',          cor: '#8b5cf6' },
        'TEAP':    { nome: 'Tópicos Especializados',         cor: '#f59e0b' },
        'PVAT':    { nome: 'Veículos e Acidentes',           cor: '#10b981' },
        'TO':      { nome: 'Técnicas Operacionais',          cor: '#475569' },
        'SOP':     { nome: 'Socorrismo Policial',            cor: '#ec4899' },
        'DPP':     { nome: 'Defesa Pessoal',                 cor: '#b45309' },
        'TFP':     { nome: 'Treinamento Físico',             cor: '#65a30d' },
        'DPP/TFP': { nome: 'Defesa Pessoal + Treino Físico', cor: '#b45309' },
        'TFP/DPP': { nome: 'Treino Físico + Defesa Pessoal', cor: '#b45309' },
        'PRO':     { nome: 'Produtos e Contratações',        cor: '#0ea5e9' },
        'PPROC':   { nome: 'Produtos e Contratações',        cor: '#0ea5e9' },
        'PCEB':    { nome: 'Explosivos e Balística',         cor: '#dc2626' },
        'PPCEXB':  { nome: 'Explosivos e Balística',         cor: '#dc2626' },
        'DOC':     { nome: 'Documentoscopia',                cor: '#7c3aed' },
        'LOC':     { nome: 'Locais de Crime',                cor: '#059669' },
        'ISDC':    { nome: 'Socioemocional e Diversidade',   cor: '#d946ef' },
        'DO':      { nome: 'Direção Operacional',            cor: '#f97316' },
        'APC':     { nome: 'Atividade Policial em Campo',    cor: '#84cc16' },
        'IF':      { nome: 'Informática Forense',            cor: '#0891b2' },
        'JEC':     { nome: 'Jornada de Criminalística',      cor: '#1d4ed8' }
    };
    const COR_EVENTO = '#94a3b8';

    function agendaInfoAula(aulaStr) {
        const s = String(aulaStr || '');
        const head = (s.split(/[\s(]/)[0] || '').trim().toUpperCase();
        if (/^(EVENTOS?|AA|AMAG|IEC)$/.test(head)) {
            const nome = s.replace(/^EVENTOS?\s*-?\s*/i, '').trim() || 'Evento';
            return { nome, cor: COR_EVENTO, codigo: '', isEvento: true };
        }
        const info = AGENDA_DISC[head];
        return {
            nome: info ? info.nome : head,
            cor: info ? info.cor : '#64748b',
            codigo: s,
            isEvento: false
        };
    }

    function corAlpha(hex, a) {
        const n = parseInt(hex.slice(1), 16);
        return 'rgba(' + ((n >> 16) & 255) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255) + ', ' + a + ')';
    }

    // Bloco de aula colorido (usado na lista, no card Hoje e por dia)
    function blocoHtml(b) {
        const info = agendaInfoAula(b.aula);
        const codigo = info.isEvento ? '' : `<span class="agenda-codigo">${info.codigo}</span>`;
        return `
            <div class="agenda-bloco" style="border-left-color: ${info.cor};">
                <span class="agenda-horario"><i class="ph ph-clock"></i> ${b.horario}</span>
                <span class="agenda-disc" title="${b.aula}"><span class="disc-dot" style="background: ${info.cor};"></span>${info.nome}</span>
                ${codigo}
            </div>
        `;
    }

    // Card "HOJE" no topo (só quando o mês exibido é o mês corrente)
    function renderHeroHoje(data, ehMesAtual, diaHoje) {
        if (!hojeCardEl) return;
        if (!ehMesAtual) { hojeCardEl.style.display = 'none'; return; }
        const diaData = data.find(item => parseInt(item.dia, 10) === diaHoje);
        const agora = new Date();
        const dataFmt = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
        let corpo;
        const qtd = diaData && diaData.blocos ? diaData.blocos.length : 0;
        if (qtd > 0) {
            corpo = diaData.blocos.map(blocoHtml).join('');
        } else {
            const prox = data.map(it => parseInt(it.dia, 10)).filter(d => d > diaHoje).sort((a, b) => a - b)[0];
            corpo = `<p class="hoje-vazio"><i class="ph ph-coffee"></i> Sem aulas hoje.${prox ? ` Próxima aula no dia <strong>${prox}</strong>.` : ''}</p>`;
        }
        hojeCardEl.innerHTML = `
            <div class="glass-panel agenda-hoje-hero">
                <div class="hoje-hero-header">
                    <span class="hoje-pill">HOJE</span>
                    <strong class="hoje-data">${dataFmt}</strong>
                    ${qtd ? `<span class="hoje-count">${qtd} bloco${qtd > 1 ? 's' : ''} de aula</span>` : ''}
                </div>
                <div class="agenda-card-body">${corpo}</div>
            </div>
        `;
        hojeCardEl.style.display = 'block';
    }

    // Resumo do mês: chips com a contagem de blocos por disciplina
    function renderResumoMes(data) {
        if (!resumoEl) return;
        const contagem = new Map();
        data.forEach(dia => (dia.blocos || []).forEach(b => {
            const info = agendaInfoAula(b.aula);
            const key = info.isEvento ? '__EVENTO__' : info.nome;
            const cur = contagem.get(key) || { nome: info.isEvento ? 'Eventos' : info.nome, cor: info.cor, n: 0 };
            cur.n++;
            contagem.set(key, cur);
        }));
        if (contagem.size === 0) { resumoEl.style.display = 'none'; return; }
        const itens = [...contagem.values()].sort((a, b) => b.n - a.n);
        resumoEl.innerHTML = `
            <div class="glass-panel agenda-resumo-panel">
                <span class="resumo-title"><i class="ph ph-chart-pie-slice"></i> Resumo do mês</span>
                <div class="resumo-chips">
                    ${itens.map(it => `<span class="resumo-chip" title="${it.n} bloco(s) de aula no mês"><span class="disc-dot" style="background: ${it.cor};"></span>${it.nome}<b>${it.n}</b></span>`).join('')}
                </div>
            </div>
        `;
        resumoEl.style.display = 'block';
    }

    // Navegação rápida de mês (setas e botão Hoje)
    function atualizarBotoesMes() {
        const opts = Array.from(agendaMes.options).filter(o => !o.disabled);
        const i = opts.findIndex(o => o.value === agendaMes.value);
        if (btnMesPrev) btnMesPrev.disabled = i <= 0;
        if (btnMesNext) btnMesNext.disabled = i === -1 || i >= opts.length - 1;
        if (btnMesHoje) btnMesHoje.disabled = !opts.some(o => o.value === currentMonthStr);
    }

    function moverMes(delta) {
        const opts = Array.from(agendaMes.options).filter(o => !o.disabled);
        const i = opts.findIndex(o => o.value === agendaMes.value);
        const novo = i + delta;
        if (i === -1 || novo < 0 || novo >= opts.length) return;
        agendaMes.value = opts[novo].value;
        renderAgenda();
    }

    if (btnMesPrev) btnMesPrev.addEventListener('click', () => moverMes(-1));
    if (btnMesNext) btnMesNext.addEventListener('click', () => moverMes(1));
    if (btnMesHoje) btnMesHoje.addEventListener('click', () => {
        if (Array.from(agendaMes.options).some(o => o.value === currentMonthStr)) {
            agendaMes.value = currentMonthStr;
            renderAgenda();
            setTimeout(() => {
                const alvo = document.querySelector('#agenda-cards-container .agenda-hoje') ||
                             document.querySelector('#agenda-calendar-container .calendar-day.hoje');
                if (alvo) alvo.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 80);
        }
    });
    
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
    if (agendaDados.cargos.length > 0) {
        agendaCargo.value = agendaDados.cargos[0].id;
    }
    // Com um único cargo, o seletor é redundante — esconde o campo
    if (agendaDados.cargos.length <= 1) {
        const cargoGroup = document.querySelector('.agenda-cargo-group');
        if (cargoGroup) cargoGroup.style.display = 'none';
    }
    
    // Popular meses
    agendaDados.meses.forEach(mes => {
        const opt = document.createElement('option');
        opt.value = mes.id;
        opt.textContent = mes.nome;
        agendaMes.appendChild(opt);
    });

    // Auto-selecionar o mês atual, se existir na lista
    const today = new Date();
    const currentMonthStr = String(today.getMonth() + 1).padStart(2, '0') + '-' + today.getFullYear();
    
    if (Array.from(agendaMes.options).some(opt => opt.value === currentMonthStr)) {
        agendaMes.value = currentMonthStr;
    } else if (agendaDados.meses.length > 0) {
        agendaMes.value = agendaDados.meses[0].id;
    }

    agendaMes.disabled = false;
    
    // Chamar render inicial (usa setTimeout para garantir que elementos no DOM estejam prontos se necessário)
    setTimeout(() => {
        if(agendaMes.value) renderAgenda();
    }, 10);
    
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
            if (hojeCardEl) hojeCardEl.style.display = 'none';
            if (resumoEl) resumoEl.style.display = 'none';
            atualizarBotoesMes();
            return;
        }
        
        // Datas de referência para marcar hoje/passado
        const [mStrRef, yStrRef] = mesId.split('-');
        const mesNumRef = parseInt(mStrRef, 10);
        const anoNumRef = parseInt(yStrRef, 10);
        const agora = new Date();
        const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
        const ehMesAtual = (agora.getMonth() + 1 === mesNumRef) && (agora.getFullYear() === anoNumRef);
        const diaHoje = agora.getDate();

        renderHeroHoje(data, ehMesAtual, diaHoje);
        renderResumoMes(data);

        data.forEach(dia => {
            const diaNum = parseInt(dia.dia, 10);
            const isHoje = ehMesAtual && diaNum === diaHoje;
            const isPassado = new Date(anoNumRef, mesNumRef - 1, diaNum) < inicioHoje;
            const statusBadge = isHoje
                ? '<span class="agenda-dia-badge hoje-pill">HOJE</span>'
                : (isPassado ? '<span class="agenda-dia-badge passado-pill"><i class="ph ph-check"></i> concluído</span>' : '');
            const card = document.createElement('div');
            card.className = 'glass-panel agenda-card' + (isHoje ? ' agenda-hoje' : '') + (isPassado ? ' agenda-passado' : '');
            
            let blocosHtml = dia.blocos.map(blocoHtml).join('');
            
            card.innerHTML = `
                <div class="agenda-card-header">
                    <span class="dia-numero">Dia ${dia.dia} ${statusBadge}</span>
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
                    const info = agendaInfoAula(b.aula);
                    classesHtml += `
                        <div class="calendar-event" style="border-left-color: ${info.cor}; background: ${corAlpha(info.cor, 0.12)}; color: ${info.cor};" title="${b.horario} — ${b.aula}">
                            <span class="horario">${b.horario.split(' ')[0]}</span>
                            <span class="aula">${info.nome}</span>
                        </div>
                    `;
                });
            }

            const isHojeCal = ehMesAtual && d === diaHoje;
            const isPassadoCal = new Date(anoNumRef, mesNumRef - 1, d) < inicioHoje;
            const classesDia = (isHojeCal ? ' hoje' : '') + (isPassadoCal ? ' passado' : '');

            calendarHtml += `
                <div class="glass-panel calendar-day${classesDia}">
                    <div class="calendar-day-number">${isHojeCal ? '<span class="cal-hoje-pill">HOJE</span> ' : ''}${d}</div>
                    <div class="calendar-events-container">
                        ${classesHtml}
                    </div>
                </div>
            `;
        }
        
        calendarHtml += '</div>';
        agendaCalendarContainer.innerHTML = calendarHtml;

        atualizarBotoesMes();
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

// ==========================================
// ANOTAÇÕES — editor rich text + lista filtrável
// (estado global `anotacoes` declarado no topo; sincroniza na nuvem)
// ==========================================
let notesEditId = null;
let notesDiscPopulated = false;
let notesSavedRange = null;

function salvarAnotacoesStore() {
    localStorage.setItem('pcpr_notes', JSON.stringify(anotacoes));
    requestCloudSync();
}

function notesEsc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function notesFmtData(ts) {
    if (!ts) return '';
    try {
        return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return ''; }
}

function notesDisciplinas() {
    if (!Array.isArray(bancoQuestoes)) return [];
    return [...new Set(bancoQuestoes.map(q => q.disciplina))].sort();
}
function notesConteudos(disc) {
    if (!disc || !Array.isArray(bancoQuestoes)) return [];
    return [...new Set(bancoQuestoes.filter(q => q.disciplina === disc).map(q => q.conteudo))].sort(naturalSort);
}

function notesFillDisc(sel, todasLabel) {
    sel.innerHTML = '';
    const opt0 = document.createElement('option');
    opt0.value = ''; opt0.textContent = todasLabel;
    sel.appendChild(opt0);
    notesDisciplinas().forEach(d => {
        const o = document.createElement('option');
        o.value = d; o.textContent = d;
        sel.appendChild(o);
    });
}
function notesFillConteudo(sel, disc, todosLabel, valorSel) {
    const conts = notesConteudos(disc);
    sel.innerHTML = '';
    const opt0 = document.createElement('option');
    opt0.value = ''; opt0.textContent = todosLabel;
    sel.appendChild(opt0);
    conts.forEach(c => {
        const o = document.createElement('option');
        o.value = c; o.textContent = c;
        if (c === valorSel) o.selected = true;
        sel.appendChild(o);
    });
    sel.disabled = conts.length === 0;
}

// Aberta ao entrar na aba: popula selects (uma vez) e mostra a lista
function abrirAnotacoes() {
    if (!notesDiscPopulated && Array.isArray(bancoQuestoes) && bancoQuestoes.length) {
        notesFillDisc(document.getElementById('notes-filtro-disciplina'), 'Todas as disciplinas');
        notesFillDisc(document.getElementById('note-disciplina'), '— Sem disciplina —');
        notesDiscPopulated = true;
    }
    document.getElementById('notes-editor-area').style.display = 'none';
    document.getElementById('notes-list-area').style.display = 'block';
    renderNotesList();
}

function renderNotesList() {
    const cont = document.getElementById('notes-list');
    if (!cont) return;
    const termo = (document.getElementById('notes-busca').value || '').trim().toLowerCase();
    const fDisc = document.getElementById('notes-filtro-disciplina').value;
    const fCont = document.getElementById('notes-filtro-conteudo').value;

    let lista = anotacoes.slice().sort((a, b) => (b.atualizadoEm || 0) - (a.atualizadoEm || 0));
    if (fDisc) lista = lista.filter(n => n.disciplina === fDisc);
    if (fCont) lista = lista.filter(n => n.conteudo === fCont);
    if (termo) lista = lista.filter(n =>
        (n.titulo || '').toLowerCase().includes(termo) ||
        (n.texto || '').toLowerCase().includes(termo));

    if (lista.length === 0) {
        const vazioGeral = anotacoes.length === 0;
        cont.innerHTML = `<div class="notes-empty"><i class="ph ph-note-blank"></i>${vazioGeral
            ? 'Você ainda não tem anotações.<br>Clique em <strong>Nova Anotação</strong> para começar.'
            : 'Nenhuma anotação encontrada com os filtros atuais.'}</div>`;
        return;
    }

    cont.innerHTML = '';
    lista.forEach(n => {
        const card = document.createElement('div');
        card.className = 'note-card';
        const tags = [];
        if (n.disciplina) tags.push(`<span class="note-tag"><i class="ph ph-book-open"></i>${notesEsc(n.disciplina)}</span>`);
        if (n.conteudo) tags.push(`<span class="note-tag conteudo">${notesEsc(n.conteudo)}</span>`);
        const snippet = (n.texto || '').slice(0, 180);
        card.innerHTML = `
            <div class="note-card-title">${notesEsc(n.titulo || 'Sem título')}</div>
            ${tags.length ? `<div class="note-card-tags">${tags.join('')}</div>` : ''}
            <div class="note-card-snippet">${snippet ? notesEsc(snippet) : '<em>(sem texto)</em>'}</div>
            <div class="note-card-footer">
                <span class="note-card-date"><i class="ph ph-clock"></i> ${notesFmtData(n.atualizadoEm)}</span>
                <div class="note-card-actions">
                    <button title="Editar" data-edit="${n.id}"><i class="ph ph-pencil-simple"></i></button>
                    <button class="danger" title="Excluir" data-del="${n.id}"><i class="ph ph-trash"></i></button>
                </div>
            </div>`;
        card.addEventListener('click', (e) => {
            if (e.target.closest('[data-del]')) { e.stopPropagation(); notesExcluir(n.id); return; }
            notesAbrirEditor(n.id);
        });
        cont.appendChild(card);
    });
}

function notesAbrirEditor(id) {
    notesEditId = id || null;
    const note = id ? anotacoes.find(n => n.id === id) : null;

    document.getElementById('notes-list-area').style.display = 'none';
    document.getElementById('notes-editor-area').style.display = 'block';
    document.getElementById('btn-notes-excluir').style.display = note ? 'inline-flex' : 'none';

    const titulo = document.getElementById('note-titulo');
    const selDisc = document.getElementById('note-disciplina');
    const selCont = document.getElementById('note-conteudo');
    const editor = document.getElementById('note-editor');

    titulo.value = note ? (note.titulo || '') : '';
    selDisc.value = note && note.disciplina ? note.disciplina : '';
    notesFillConteudo(selCont, selDisc.value, '— Opcional —', note ? note.conteudo : '');
    editor.innerHTML = note ? (note.html || '') : '';
    notesSavedRange = null;

    window.scrollTo(0, 0);
    titulo.focus();
}

function notesFecharEditor() {
    notesEditId = null;
    abrirAnotacoes();
}

function notesSalvar() {
    const titulo = document.getElementById('note-titulo').value.trim();
    const editor = document.getElementById('note-editor');
    const html = editor.innerHTML;
    const texto = (editor.textContent || '').replace(/\s+/g, ' ').trim();

    if (!titulo && !texto) {
        alert('Escreva ao menos um título ou um conteúdo para salvar a anotação.');
        return;
    }
    const disc = document.getElementById('note-disciplina').value;
    const cont = document.getElementById('note-conteudo').value;
    const agora = Date.now();

    if (notesEditId) {
        const n = anotacoes.find(x => x.id === notesEditId);
        if (n) {
            n.titulo = titulo || 'Sem título';
            n.disciplina = disc; n.conteudo = cont;
            n.html = html; n.texto = texto;
            n.atualizadoEm = agora;
        }
    } else {
        anotacoes.push({
            id: 'n_' + agora.toString(36) + Math.random().toString(36).slice(2, 7),
            titulo: titulo || 'Sem título',
            disciplina: disc, conteudo: cont,
            html: html, texto: texto,
            criadoEm: agora, atualizadoEm: agora
        });
    }
    salvarAnotacoesStore();

    const status = document.getElementById('notes-editor-titulo-status');
    if (status) {
        status.textContent = 'Anotação salva!';
        status.classList.add('show');
        setTimeout(() => status.classList.remove('show'), 1600);
    }
    notesFecharEditor();
}

function notesExcluir(id) {
    const n = anotacoes.find(x => x.id === id);
    if (!n) return;
    if (!confirm(`Excluir a anotação "${n.titulo || 'Sem título'}"? Esta ação não pode ser desfeita.`)) return;
    anotacoes = anotacoes.filter(x => x.id !== id);
    salvarAnotacoesStore();
    if (notesEditId === id) notesFecharEditor();
    else renderNotesList();
}

// --- Rich text (execCommand com restauração de seleção) ---
function notesExecRT(cmd, value) {
    const editor = document.getElementById('note-editor');
    editor.focus();
    if (notesSavedRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(notesSavedRange);
    }
    try { document.execCommand(cmd, false, value == null ? null : value); } catch (e) {}
    notesAtualizarBotoesRT();
}

function notesAtualizarBotoesRT() {
    document.querySelectorAll('#rt-toolbar .rt-btn[data-cmd]').forEach(btn => {
        let active = false;
        try { active = document.queryCommandState(btn.dataset.cmd); } catch (e) {}
        btn.classList.toggle('active', active);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const novaBtn = document.getElementById('btn-nova-anotacao');
    if (!novaBtn) return;

    novaBtn.addEventListener('click', () => notesAbrirEditor(null));
    document.getElementById('btn-notes-voltar').addEventListener('click', notesFecharEditor);
    document.getElementById('btn-notes-salvar').addEventListener('click', notesSalvar);
    document.getElementById('btn-notes-excluir').addEventListener('click', () => { if (notesEditId) notesExcluir(notesEditId); });

    // Filtros
    const busca = document.getElementById('notes-busca');
    const fDisc = document.getElementById('notes-filtro-disciplina');
    const fCont = document.getElementById('notes-filtro-conteudo');
    busca.addEventListener('input', renderNotesList);
    fDisc.addEventListener('change', () => {
        notesFillConteudo(fCont, fDisc.value, 'Todos os conteúdos', '');
        renderNotesList();
    });
    fCont.addEventListener('change', renderNotesList);
    document.getElementById('notes-filtro-limpar').addEventListener('click', () => {
        busca.value = '';
        fDisc.value = '';
        fCont.innerHTML = '<option value="">Todos os conteúdos</option>';
        fCont.disabled = true;
        renderNotesList();
    });

    // Editor: disciplina -> conteúdo
    const eDisc = document.getElementById('note-disciplina');
    const eCont = document.getElementById('note-conteudo');
    eDisc.addEventListener('change', () => notesFillConteudo(eCont, eDisc.value, '— Opcional —', ''));

    // Barra de ferramentas rich text
    const toolbar = document.getElementById('rt-toolbar');
    // Mantém a seleção no editor ao clicar nos botões (não nos selects/inputs de cor)
    toolbar.addEventListener('mousedown', (e) => {
        if (e.target.closest('.rt-btn')) e.preventDefault();
    });
    toolbar.querySelectorAll('.rt-btn[data-cmd]').forEach(btn =>
        btn.addEventListener('click', () => notesExecRT(btn.dataset.cmd)));
    toolbar.querySelectorAll('.rt-btn[data-block]').forEach(btn =>
        btn.addEventListener('click', () => notesExecRT('formatBlock', btn.dataset.block)));
    const fmt = document.getElementById('rt-format');
    fmt.addEventListener('change', () => { notesExecRT('formatBlock', fmt.value); fmt.selectedIndex = 0; });
    document.getElementById('rt-forecolor').addEventListener('input', (e) => notesExecRT('foreColor', e.target.value));
    document.getElementById('rt-hilite').addEventListener('input', (e) => notesExecRT('hiliteColor', e.target.value));
    const linkBtn = toolbar.querySelector('[data-action="link"]');
    if (linkBtn) linkBtn.addEventListener('click', () => {
        const url = prompt('Endereço do link (inclua https://):', 'https://');
        if (url) notesExecRT('createLink', url);
    });

    const editor = document.getElementById('note-editor');
    editor.addEventListener('keyup', notesAtualizarBotoesRT);
    editor.addEventListener('mouseup', notesAtualizarBotoesRT);
    editor.addEventListener('blur', () => {
        if (!editor.textContent.trim() && !editor.querySelector('img')) editor.innerHTML = '';
    });
    editor.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); notesSalvar(); }
    });

    // Memoriza a seleção atual dentro do editor (para aplicar cor/formato sem perdê-la)
    document.addEventListener('selectionchange', () => {
        const ed = document.getElementById('note-editor');
        if (!ed) return;
        const sel = window.getSelection();
        if (sel && sel.rangeCount && ed.contains(sel.anchorNode)) {
            notesSavedRange = sel.getRangeAt(0).cloneRange();
        }
    });
});
