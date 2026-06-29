// ==========================================
// TEMA (modo escuro / claro)
// ==========================================
const VERCEL_API_URL = window.location.protocol === 'file:' ? 'https://cfp-perito-simulador.vercel.app' : '';

// ==========================================
// FILTRO GLOBAL DE CARGO
// ==========================================
let cargoAtual = 'todos';
try {
    const savedCargo = localStorage.getItem('pcpr_cargo');
    if (savedCargo) cargoAtual = savedCargo;
} catch (e) {}

// Executado no carregamento da página para definir o valor no HTML
document.addEventListener('DOMContentLoaded', () => {
    const sel = document.getElementById('global-cargo-filter');
    if (sel) sel.value = cargoAtual;
});

function alterarCargoGlobal() {
    const sel = document.getElementById('global-cargo-filter');
    if (sel) {
        cargoAtual = sel.value;
        try { localStorage.setItem('pcpr_cargo', cargoAtual); } catch (e) {}
        
        // Disparar atualizações em toda a interface
        if (typeof atualizarFiltrosDeDisciplina === 'function') {
            atualizarFiltrosDeDisciplina();
        }
    }
}

function disciplinaPermitidaParaCargo(disciplina) {
    if (!disciplina) return true;
    if (cargoAtual === 'todos') return true;

    const dUpper = disciplina.toUpperCase();
    
    // Regras
    const isIPO2 = dUpper.includes('IPO 2') || dUpper.includes('IPO II)') || dUpper.includes('IPO II -');
    const isPeritoEspecifico = dUpper.includes('CRIMINALÍSTICA') || 
                               dUpper.includes('IPO 3') || dUpper.includes('IPO III') || 
                               dUpper.includes('PCEB') || 
                               dUpper.includes('PVAT') || 
                               dUpper.includes('LOCAL DE CRIME') ||
                               dUpper.includes('LOCAIS DE CRIME') ||
                               dUpper.includes('LOC -');
    
    if (cargoAtual === 'perito') {
        if (isIPO2) return false;
        return true; 
    }
    
    if (cargoAtual === 'delegado' || cargoAtual === 'escrivao') {
        if (isPeritoEspecifico) return false;
        return true; 
    }
    
    return true;
}
// Expose to window for flashcards.js (loaded before app.js DOMContentLoaded)
window.disciplinaPermitidaParaCargo = disciplinaPermitidaParaCargo;

function atualizarFiltrosDeDisciplina() {
    // 1. Banco de Questões (msDisciplina)
    if (typeof msDisciplina !== 'undefined' && msDisciplina && typeof bancoQuestoes !== 'undefined') {
        const disciplinas = [...new Set(bancoQuestoes.map(q => q.disciplina))].sort(naturalSort);
        msDisciplina.setOptions(disciplinas
            .filter(d => disciplinaPermitidaParaCargo(d))
            .map(d => ({
            value: d,
            label: d,
            count: bancoQuestoes.filter(q => q.disciplina === d).length
        })));
        msDisciplina.selectNone();
    }
    
    // 2. Simulado (msSimDisciplina)
    if (typeof msSimDisciplina !== 'undefined' && msSimDisciplina && typeof bancoQuestoes !== 'undefined') {
        const disciplinas = [...new Set(bancoQuestoes.map(q => q.disciplina))].sort(naturalSort);
        msSimDisciplina.setOptions(disciplinas
            .filter(d => disciplinaPermitidaParaCargo(d))
            .map(d => ({
            value: d,
            label: d,
            count: bancoQuestoes.filter(q => q.disciplina === d).length
        })));
        msSimDisciplina.selectNone();
    }
    
    // 3. Materiais
    const selMat = document.getElementById('material-disciplina-select');
    if (selMat) {
        Array.from(selMat.options).forEach(opt => {
            if (!opt.value) return; // pular placeholder
            opt.style.display = disciplinaPermitidaParaCargo(opt.text) ? '' : 'none';
        });
        if (selMat.selectedOptions[0] && selMat.selectedOptions[0].style.display === 'none') {
            selMat.value = '';
            if (typeof filtrarMateriais === 'function') filtrarMateriais();
        }
    }
    
    // 4. Notas
    const fDisc = document.getElementById('notes-filtro-disciplina');
    const nDisc = document.getElementById('note-disciplina');
    if (fDisc && typeof notesFillDisc === 'function') notesFillDisc(fDisc, 'Todas as disciplinas');
    if (nDisc && typeof notesFillDisc === 'function') notesFillDisc(nDisc, '- Sem disciplina -');
    
    // 5. Flashcards
    if (typeof fcToggleCustomDeck === 'function' && typeof fcRenderDecksSelect === 'function') {
        fcRenderDecksSelect();
    }

    // 6. Estatísticas / Dashboard — refletir o cargo nos indicadores e na lista por capítulo
    if (typeof atualizarTelaDashboard === 'function') atualizarTelaDashboard();
}



// O tema inicial já é aplicado no <head> via inline script,
// para evitar "flash" de tema claro ao abrir no modo escuro.
function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark-mode');
    try {
        localStorage.setItem('pcpr_theme', isDark ? 'dark' : 'light');
    } catch (e) {}
    // Reflete o tema no conteúdo do material (iframe) caso esteja aberto
    if (typeof aplicarTemaIframeMaterial === 'function') aplicarTemaIframeMaterial();
}

// Aplica/remove o modo escuro DENTRO do iframe do material (documento próprio,
// que não herda o dark-mode do app). Usa inversão de luminância preservando o
// matiz das cores; fotos (img/video) são reinvertidas para não ficarem negativas.
function aplicarTemaIframeMaterial() {
    const iframe = document.getElementById('material-iframe');
    if (!iframe) return;
    let doc;
    try { doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document); }
    catch (e) { return; } // cross-origin — ignora
    if (!doc || !doc.documentElement) return;

    let st = doc.getElementById('__mat_dark_style');
    if (!st) {
        st = doc.createElement('style');
        st.id = '__mat_dark_style';
        st.textContent =
            'html.mat-dark{filter:invert(0.9) hue-rotate(180deg);background-color:#0f172a !important;}' +
            'html.mat-dark img,html.mat-dark video{filter:invert(1) hue-rotate(180deg);}';
        (doc.head || doc.documentElement).appendChild(st);
    }
    const dark = document.documentElement.classList.contains('dark-mode');
    doc.documentElement.classList.toggle('mat-dark', dark);
}

// VARIÁVEIS GLOBAIS
let bancoQuestoes = [];
// IDs de questões excluídas pelo admin (lista global no servidor; filtrada ao carregar)
let questoesExcluidasSet = new Set();

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

    // Manter logado: se já houve login aprovado neste navegador, restaura a sessão
    // automaticamente, sem precisar digitar de novo. O controle de acesso
    // (pendente/bloqueado) continua sendo revalidado pela API dentro de tryLogin.
    if (savedUser && savedUser.trim().length >= 2) {
        tryLogin(savedUser, true);
    }
});

async function tryLogin(username, autoRestore = false) {
    if (!username || username.trim().length < 2) {
        if (!autoRestore) alert("Digite um nome válido com pelo menos 2 caracteres.");
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
    
    // Carregar dados da nuvem (na restauração de sessão isto é pulado: usamos os
    // dados locais deste navegador — rápido e funciona offline. A sincronização
    // entre dispositivos continua disponível no botão da nuvem.)
    if (!autoRestore) try {
        const response = await fetch(`${VERCEL_API_URL}/api/load?username=${encodeURIComponent(user)}`);

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
                    // Garantir que flashcards é sempre um array
                    const fcData = Array.isArray(result.data.flashcards)
                        ? result.data.flashcards
                        : Object.values(result.data.flashcards || {});
                    if (fcData.length > 0) {
                        localStorage.setItem('pcpr_flashcards', JSON.stringify(fcData));
                    }
                }
                if (result.data.anotacoes) localStorage.setItem('pcpr_notes', JSON.stringify(result.data.anotacoes));
            }
        }
    } catch (e) {
        console.error("Erro ao buscar dados na nuvem. Usando dados locais como fallback.", e);
    }
    
    // Garantir que a variável em memória flashcards seja atualizada
    if (typeof loadFlashcards === 'function') {
        try { loadFlashcards(); } catch(e) { console.error("Erro no loadFlashcards", e); }
    }
    
    try {
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
        await carregarQuestoesExcluidas(); // antes de montar a base, para já filtrar
        carregarBancoQuestoes();
        carregarDadosPessoais();
        limparHistoricoOrfao(); // remove do histórico/stats as resoluções de questões que não existem mais na base
        carregarEstatisticas();
        atualizarHeaderStats();
        configurarEventos();
        carregarControleCurso();
    } catch (criticalError) {
        console.error("Erro crítico ao tentar inicializar o app:", criticalError);
        alert("Erro ao iniciar o aplicativo: " + criticalError.message);
        
        // Forçar a entrada mesmo com erro
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('main-app-container').style.display = 'block';
    }
}

let syncPending = false;

function requestCloudSync() {
    if (!currentUser) return;
    if (syncTimeout) clearTimeout(syncTimeout);
    syncPending = true;
    
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
            await fetch(`${VERCEL_API_URL}/api/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser, data: payload })
            });
            console.log("Progresso salvo na nuvem!");
            syncPending = false;
        } catch (e) {
            console.error("Falha ao salvar na nuvem", e);
        }
    }, 2000); // 2 segundos de debounce para não spammar requisições
}

// Avisar antes de fechar a aba se houver sync pendente
window.addEventListener('beforeunload', (e) => {
    if (syncPending) {
        e.preventDefault();
        e.returnValue = 'Seu progresso ainda está sendo salvo na nuvem. Aguarde um momento antes de fechar.';
    }
});

// Encerrar a sessão (logout). Envia o progresso pendente para a nuvem antes de
// sair e só então limpa os dados locais, para nunca perder o que ainda não subiu.
async function logout() {
    if (!confirm('Deseja sair da sua conta?\n\nSeu progresso será salvo na nuvem antes de sair.')) return;

    let savedOk = true;

    // Envia imediatamente qualquer progresso pendente (ignora o debounce de 2s)
    if (currentUser) {
        if (syncTimeout) { clearTimeout(syncTimeout); syncTimeout = null; }
        try {
            let agendaAplicada = {};
            try { agendaAplicada = JSON.parse(localStorage.getItem('pcpr_agenda_aplicada') || '{}'); } catch (e) {}
            await fetch(`${VERCEL_API_URL}/api/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser, data: {
                    stats: stats,
                    favoritos: favoritos,
                    comentarios: comentarios,
                    historico: historicoQuestoes,
                    progresso: progressoCurso,
                    agendaAplicada: agendaAplicada,
                    materialEstudado: materialEstudado,
                    flashcards: (typeof flashcards !== 'undefined' ? flashcards : []),
                    anotacoes: anotacoes
                }})
            });
        } catch (e) {
            savedOk = false;
            console.error('Falha ao salvar na nuvem durante o logout', e);
        }
    }

    // Sempre remove o marcador de auto-login para de fato deslogar.
    localStorage.removeItem('pcpr_current_user');

    // Só limpa os dados locais do usuário se o backup na nuvem foi confirmado,
    // para nunca perder progresso que ainda não subiu (ex.: offline / uso local).
    if (savedOk) {
        localStorage.removeItem('pcpr_stats');
        localStorage.removeItem('pcpr_favorites');
        localStorage.removeItem('pcpr_comments');
        localStorage.removeItem('pcpr_history');
        localStorage.removeItem('pcpr_course_progress');
        localStorage.removeItem('pcpr_agenda_aplicada');
        localStorage.removeItem('pcpr_material_studied');
        localStorage.removeItem('pcpr_flashcards');
        localStorage.removeItem('pcpr_notes');
    } else {
        alert('Não foi possível confirmar o backup na nuvem. Seus dados locais foram mantidos neste navegador.');
    }

    // Evita o aviso de "progresso ainda sendo salvo" ao recarregar.
    syncPending = false;

    // Volta para a tela de login.
    location.reload();
}

// ==========================================
// SINCRONIZAÇÃO MANUAL
// ==========================================
async function syncLocalWithCloud() {
    if (!currentUser) return;
    
    const btn = document.getElementById('btn-sync-cloud');
    if (btn) {
        btn.classList.add('syncing');
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i>';
    }

    try {
        // 1. Baixa da Nuvem
        const response = await fetch(`${VERCEL_API_URL}/api/load?username=${encodeURIComponent(currentUser)}`);
        if (!response.ok) throw new Error('Falha ao baixar da nuvem');
        
        const result = await response.json();
        const cloudData = result.data || {};
        
        // 2. Coleta Local
        const localData = {
            stats: JSON.parse(localStorage.getItem('pcpr_stats') || 'null'),
            favoritos: JSON.parse(localStorage.getItem('pcpr_favorites') || '[]'),
            comentarios: JSON.parse(localStorage.getItem('pcpr_comments') || '{}'),
            historico: JSON.parse(localStorage.getItem('pcpr_history') || '{}'),
            progresso: JSON.parse(localStorage.getItem('pcpr_course_progress') || '{}'),
            agendaAplicada: JSON.parse(localStorage.getItem('pcpr_agenda_aplicada') || '{}'),
            materialEstudado: JSON.parse(localStorage.getItem('pcpr_material_studied') || '{}'),
            flashcards: JSON.parse(localStorage.getItem('pcpr_flashcards') || '[]'),
            anotacoes: JSON.parse(localStorage.getItem('pcpr_notes') || '[]')
        };

        // 3. Merge Inteligente (UNION: nunca perde dados de nenhum lado)

        // --- Histórico de Questões ---
        // Cada chave é um ID de questão. Se existe em algum lado, mantemos. Como cada
        // entrada agora acumula o total de resoluções (tentativas), em conflito ficamos
        // com o lado que tiver MAIS tentativas (mais prática registrada); empatando,
        // priorizamos 'acerto' para não regredir o aprendizado.
        const cHist = cloudData.historico || {};
        const lHist = localData.historico || {};
        const mergedHistorico = { ...cHist };
        Object.keys(lHist).forEach(id => {
            const c = cHist[id]; // dado na nuvem
            const l = lHist[id]; // dado local
            if (!c) {
                // Não existe na nuvem: inclui do local
                mergedHistorico[id] = l;
            } else {
                const cR = resolucoesDaEntrada(c);
                const lR = resolucoesDaEntrada(l);
                if (lR.tentativas > cR.tentativas) {
                    mergedHistorico[id] = l;
                } else if (lR.tentativas === cR.tentativas) {
                    // Empate em tentativas: preferência para 'acerto'
                    const lStatus = typeof l === 'string' ? l : l.status;
                    const cStatus = typeof c === 'string' ? c : c.status;
                    if (lStatus === 'acerto' || cStatus !== 'acerto') mergedHistorico[id] = l;
                }
                // Senão mantém o da nuvem (que já está lá)
            }
        });
        
        // --- Favoritos: união de arrays sem duplicata ---
        const mergedFavoritos = [...new Set([...(cloudData.favoritos || []), ...(localData.favoritos || [])])];
        
        // --- Comentários: união de chaves. Se a mesma questão tiver comentário nos dois, o local é mais novo ---
        const mergedComentarios = { ...(cloudData.comentarios || {}), ...(localData.comentarios || {}) };
        
        // --- Material Estudado: UNION aditiva ---
        // Regra: se foi marcado como estudado em QUALQUER lado, fica marcado como estudado.
        // Não desmarcamos o que já foi feito.
        const cMat = cloudData.materialEstudado || {};
        const lMat = localData.materialEstudado || {};
        const mergedMaterial = { ...cMat }; // Começa com tudo da nuvem
        Object.keys(lMat).forEach(key => {
            if (lMat[key]) {
                // Se o local marcou como estudado, garante que está marcado
                mergedMaterial[key] = true;
            }
            // Não removemos o que já existe na nuvem (não sobrescrevemos com 'false')
        });
        
        // --- Progresso do Curso: UNION (pega o mais avançado de cada campo) ---
        const cProg = cloudData.progresso || {};
        const lProg = localData.progresso || {};
        const mergedProgresso = { ...cProg };
        Object.keys(lProg).forEach(key => {
            if (!(key in mergedProgresso) || lProg[key] > mergedProgresso[key]) {
                mergedProgresso[key] = lProg[key];
            }
        });

        // --- Agenda ---
        const mergedAgenda = { ...(cloudData.agendaAplicada || {}), ...(localData.agendaAplicada || {}) };

        // --- Flashcards: união de arrays por ID, local ganha em conflito (mais recente) ---
        const cCards = Array.isArray(cloudData.flashcards) ? cloudData.flashcards : [];
        const lCards = Array.isArray(localData.flashcards) ? localData.flashcards : [];
        const cardMap = new Map();
        cCards.forEach(c => { if (c && c.id) cardMap.set(c.id, c); });
        lCards.forEach(c => { if (c && c.id) cardMap.set(c.id, c); }); // local sobrescreve nuvem
        const mergedFlashcards = Array.from(cardMap.values());
        
        // --- Anotações: união por ID, local ganha em conflito (mais recente) ---
        const cNotes = Array.isArray(cloudData.anotacoes) ? cloudData.anotacoes : [];
        const lNotes = Array.isArray(localData.anotacoes) ? localData.anotacoes : [];
        const noteMap = new Map();
        cNotes.forEach(n => { if (n && n.id) noteMap.set(n.id, n); });
        lNotes.forEach(n => { if (n && n.id) noteMap.set(n.id, n); }); // local sobrescreve nuvem
        const mergedAnotacoes = Array.from(noteMap.values());

        // Atualiza memória e localStorage
        localStorage.setItem('pcpr_history', JSON.stringify(mergedHistorico));
        localStorage.setItem('pcpr_favorites', JSON.stringify(mergedFavoritos));
        localStorage.setItem('pcpr_comments', JSON.stringify(mergedComentarios));
        localStorage.setItem('pcpr_material_studied', JSON.stringify(mergedMaterial));
        localStorage.setItem('pcpr_course_progress', JSON.stringify(mergedProgresso));
        localStorage.setItem('pcpr_agenda_aplicada', JSON.stringify(mergedAgenda));
        localStorage.setItem('pcpr_flashcards', JSON.stringify(mergedFlashcards));
        localStorage.setItem('pcpr_notes', JSON.stringify(mergedAnotacoes));
        
        // Recalcula os totais (total de resoluções/tentativas) a partir do histórico
        // mesclado, mantendo os indicadores consistentes após o merge.
        const tMerge = somarMapaResolucoes(mergedHistorico);
        const statsRecalc = { totalResolvidas: tMerge.resolucoes, totalAcertos: tMerge.acertos, totalErros: tMerge.erros };
        stats = statsRecalc;
        localStorage.setItem('pcpr_stats', JSON.stringify(statsRecalc));

        // 4. Envia para a nuvem
        const payload = {
            stats: statsRecalc,
            favoritos: mergedFavoritos,
            comentarios: mergedComentarios,
            historico: mergedHistorico,
            progresso: mergedProgresso,
            agendaAplicada: mergedAgenda,
            materialEstudado: mergedMaterial,
            flashcards: mergedFlashcards,
            anotacoes: mergedAnotacoes
        };

        await fetch(`${VERCEL_API_URL}/api/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser, data: payload })
        });

        // Reaplica os dados mesclados na interface SEM recarregar a página.
        // (O window.location.reload() anterior reiniciava o app e caía na tela de
        //  login — era esse o "logout" após a sincronização.)
        try { carregarDadosPessoais(); } catch (e) {}              // favoritos, comentários, histórico, anotações
        try { if (typeof carregarMaterialEstudado === 'function') carregarMaterialEstudado(); } catch (e) {}
        try { progressoCurso = JSON.parse(localStorage.getItem('pcpr_course_progress') || '{}'); } catch (e) {}
        try { if (typeof renderizarGridControle === 'function') renderizarGridControle(); } catch (e) {}
        try { if (typeof loadFlashcards === 'function') loadFlashcards(); } catch (e) {}
        try { atualizarTelaDashboard(); } catch (e) {}             // indicadores + lista por capítulo
        try { atualizarHeaderStats(); } catch (e) {}

        alert("Sincronização concluída com sucesso!");

    } catch (e) {
        console.error("Erro na sincronização:", e);
        alert("Erro ao sincronizar. Verifique sua conexão.");
    } finally {
        if (btn) {
            btn.classList.remove('syncing');
            btn.innerHTML = '<i class="ph ph-cloud-arrows"></i>';
        }
    }
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

// Carrega a lista global de questões excluídas pelo admin (fail-safe)
async function carregarQuestoesExcluidas() {
    try {
        const resp = await fetch('/api/questions');
        if (resp.ok) {
            const json = await resp.json();
            questoesExcluidasSet = new Set((json.deleted || []).map(Number));
        }
    } catch (e) {
        // API indisponível (uso local) — sem filtro de exclusão
        questoesExcluidasSet = new Set();
    }
}

// CARREGAMENTO DE DADOS
function carregarBancoQuestoes() {
    try {
        if (typeof questoesDB === 'undefined') {
            throw new Error('Variável questoesDB não encontrada. Verifique se o banco_questoes.js está correto.');
        }

        // Filtra as questões excluídas globalmente pelo admin
        bancoQuestoes = questoesDB.filter(q => !questoesExcluidasSet.has(q.id));
        window.bancoQuestoes = bancoQuestoes; // Expose globally for flashcards.js

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

        msDisciplina.setOptions(disciplinas
            .filter(d => disciplinaPermitidaParaCargo(d))
            .map(d => ({
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
    // Os contadores globais refletem o TOTAL de resoluções (tentativas). Recalcula
    // a partir do histórico já carregado para corrigir valores antigos salvos com
    // a contagem por questões distintas.
    const t = somarMapaResolucoes(historicoQuestoes);
    stats = { totalResolvidas: t.resolucoes, totalAcertos: t.acertos, totalErros: t.erros };
    try { localStorage.setItem('pcpr_stats', JSON.stringify(stats)); } catch (e) {}
    atualizarTelaDashboard();
}

// Remove do histórico (e recomputa as estatísticas) as resoluções de questões que
// NÃO existem mais na base — ex.: as questões de "data" que foram excluídas. Atua
// apenas nos dados do próprio usuário (histórico local, que é sincronizado depois);
// preserva todas as resoluções de questões que continuam na base.
function limparHistoricoOrfao() {
    if (typeof questoesDB === 'undefined' || !Array.isArray(questoesDB) || questoesDB.length < 50) return 0;
    if (!historicoQuestoes || typeof historicoQuestoes !== 'object') return 0;
    const validos = new Set(questoesDB.map(q => String(q.id)));
    let removidas = 0;
    Object.keys(historicoQuestoes).forEach(id => {
        if (!validos.has(String(id))) { delete historicoQuestoes[id]; removidas++; }
    });
    if (removidas > 0) {
        // Recomputa os contadores (total de resoluções) a partir do histórico já limpo
        const t = somarMapaResolucoes(historicoQuestoes);
        stats = { totalResolvidas: t.resolucoes, totalAcertos: t.acertos, totalErros: t.erros };
        try { localStorage.setItem('pcpr_history', JSON.stringify(historicoQuestoes)); } catch (e) {}
        try { localStorage.setItem('pcpr_stats', JSON.stringify(stats)); } catch (e) {}
        if (typeof requestCloudSync === 'function') requestCloudSync(); // propaga a limpeza para a nuvem
        console.log('Estatísticas: removidas ' + removidas + ' resolução(ões) de questões que não estão mais na base.');
    }
    return removidas;
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

// ===== Resoluções (tentativas) =====
// O painel conta o TOTAL de resoluções: cada resposta conta, inclusive ao
// reresolver a mesma questão. Cada entrada do histórico guarda { status,
// tentativas, acertos, erros }. Entradas antigas (string, ou objeto sem
// acertos/erros) são normalizadas aqui na leitura — não é preciso migrar o
// dado já salvo; as colunas acertos/erros legadas são estimadas pelo status.
function resolucoesDaEntrada(h) {
    if (typeof h === 'string') {
        return { tentativas: h ? 1 : 0, acertos: h === 'acerto' ? 1 : 0, erros: h === 'erro' ? 1 : 0, temStatus: !!h };
    }
    if (!h) return { tentativas: 0, acertos: 0, erros: 0, temStatus: false };
    const tentativas = typeof h.tentativas === 'number' ? h.tentativas : (h.status ? 1 : 0);
    const acertos = typeof h.acertos === 'number' ? h.acertos : (h.status === 'acerto' ? tentativas : 0);
    const erros = typeof h.erros === 'number' ? h.erros : (h.status === 'erro' ? tentativas : 0);
    return { tentativas, acertos, erros, temStatus: !!h.status };
}

// Soma as resoluções de um mapa de histórico (sem filtro de cargo).
// distintas = nº de questões diferentes já respondidas (usado em "Faltam"/cobertura).
function somarMapaResolucoes(mapa) {
    let resolucoes = 0, acertos = 0, erros = 0, distintas = 0;
    Object.values(mapa || {}).forEach(h => {
        const r = resolucoesDaEntrada(h);
        if (r.tentativas <= 0 && !r.temStatus) return;
        resolucoes += r.tentativas; acertos += r.acertos; erros += r.erros; distintas += 1;
    });
    return { resolucoes, acertos, erros, distintas };
}

// Soma as resoluções do histórico atual. Com respeitarCargo=true, considera só
// as questões cuja disciplina é permitida ao cargo selecionado.
function somarResolucoes(respeitarCargo) {
    const filtrar = respeitarCargo && typeof cargoAtual !== 'undefined' && cargoAtual !== 'todos';
    if (!filtrar) return somarMapaResolucoes(historicoQuestoes);
    const discPorId = new Map();
    if (Array.isArray(bancoQuestoes)) bancoQuestoes.forEach(q => discPorId.set(String(q.id), q.disciplina));
    let resolucoes = 0, acertos = 0, erros = 0, distintas = 0;
    Object.keys(historicoQuestoes).forEach(id => {
        const disc = discPorId.get(String(id));
        if (disc === undefined || !disciplinaPermitidaParaCargo(disc)) return;
        const r = resolucoesDaEntrada(historicoQuestoes[id]);
        if (r.tentativas <= 0 && !r.temStatus) return;
        resolucoes += r.tentativas; acertos += r.acertos; erros += r.erros; distintas += 1;
    });
    return { resolucoes, acertos, erros, distintas };
}

function calcularEstatisticasPorCapitulo() {
    const container = document.getElementById('chapter-stats-list');
    if (!container) return;

    const statsPorDisc = {};

    // Conta as questões do banco (total + status), respeitando o filtro de cargo
    bancoQuestoes.forEach(q => {
        const disc = q.disciplina || "Sem Disciplina";
        if (!disciplinaPermitidaParaCargo(disc)) return;
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

        // resolvidas = cobertura (questões distintas respondidas, p/ a barra e "faltam");
        // acertos/erros = total de tentativas (cada resposta conta).
        const r = resolucoesDaEntrada(historicoQuestoes[q.id]);
        if (r.tentativas > 0 || r.temStatus) {
            statsPorDisc[disc].resolvidas++;
            statsPorDisc[disc].conteudos[cap].resolvidas++;
            statsPorDisc[disc].acertos += r.acertos;
            statsPorDisc[disc].conteudos[cap].acertos += r.acertos;
            statsPorDisc[disc].erros += r.erros;
            statsPorDisc[disc].conteudos[cap].erros += r.erros;
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
        const taxaAcerto = (dStats.acertos + dStats.erros) > 0 ? Math.round((dStats.acertos / (dStats.acertos + dStats.erros)) * 100) : 0;

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
            const cTaxa = (cStats.acertos + cStats.erros) > 0 ? Math.round((cStats.acertos / (cStats.acertos + cStats.erros)) * 100) : 0;

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
    // "Resolvidas" = total de resoluções (cada resposta conta, inclusive ao
    // reresolver). "Faltam" = questões do banco ainda não respondidas (cobertura,
    // por isso usa o nº de questões DISTINTAS já respondidas). Respeita o cargo.
    const totais = somarResolucoes(true);
    const totalResolvidas = totais.resolucoes;
    const totalAcertos = totais.acertos;
    const totalErros = totais.erros;
    const distintasResolvidas = totais.distintas;

    let totalBanco = Array.isArray(bancoQuestoes) ? bancoQuestoes.length : 0;
    if (typeof cargoAtual !== 'undefined' && cargoAtual !== 'todos' && Array.isArray(bancoQuestoes)) {
        totalBanco = bancoQuestoes.filter(q => disciplinaPermitidaParaCargo(q.disciplina)).length;
    }

    document.getElementById('stat-total-resolvidas').textContent = totalResolvidas;
    document.getElementById('stat-total-acertos').textContent = totalAcertos;
    document.getElementById('stat-total-erros').textContent = totalErros;

    // Novos indicadores: total no banco, faltam (cobertura), taxa
    const faltam = Math.max(0, totalBanco - distintasResolvidas);
    const taxa = (totalAcertos + totalErros) > 0
        ? Math.round((totalAcertos / (totalAcertos + totalErros)) * 100)
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
    const elAcertos = document.getElementById('header-acertos');
    if (!elAcertos) return; // Removido do layout

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
    // Com o modal de estatísticas aberto: ESC fecha e os atalhos do quiz ficam inertes.
    const qstatsModal = document.getElementById('modal-qstats');
    if (qstatsModal && qstatsModal.classList.contains('is-open')) {
        if (e.key === 'Escape') { fecharEstatisticasQuestao(); e.preventDefault(); }
        return;
    }
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
    } else if (key === 'R') {
        questaoAleatoria();
        e.preventDefault();
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
    if (simTotal) simTotal.addEventListener('input', distribuirQuantidadesSimulado);
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
    const btnExcluirQ = document.getElementById('btn-excluir-questao');
    if (btnExcluirQ) btnExcluirQ.addEventListener('click', excluirQuestaoAtual);
    const btnStatsQ = document.getElementById('btn-stats-questao');
    if (btnStatsQ) btnStatsQ.addEventListener('click', abrirEstatisticasQuestao);
    const qstatsClose = document.getElementById('modal-qstats-close');
    if (qstatsClose) qstatsClose.addEventListener('click', fecharEstatisticasQuestao);
    const qstatsOverlay = document.getElementById('modal-qstats');
    if (qstatsOverlay) qstatsOverlay.addEventListener('click', (e) => { if (e.target === qstatsOverlay) fecharEstatisticasQuestao(); });
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
    msSimDisciplina.setOptions(disciplinas
        .filter(d => disciplinaPermitidaParaCargo(d))
        .map(d => ({
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
                if (action === 'all') {
                    cb.checked = true;
                    qty.disabled = false;
                    r.classList.add('is-selected');
                } else {
                    cb.checked = false;
                    qty.disabled = true;
                    r.classList.remove('is-selected');
                }
            });
            // Redistribui o total do simulado entre os conteúdos selecionados
            distribuirQuantidadesSimulado();
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
            qty.max = String(Math.min(5, total));
            qty.value = '0';
            qty.className = 'sim-qty';
            qty.disabled = true;

            cb.addEventListener('change', () => {
                qty.disabled = !cb.checked;
                row.classList.toggle('is-selected', cb.checked);
                // Redistribui o total entre os conteúdos selecionados (proporcional, teto 5)
                distribuirQuantidadesSimulado();
            });

            qty.addEventListener('input', () => {
                let v = parseInt(qty.value, 10);
                if (isNaN(v) || v < 0) v = 0;
                // Teto de 5 por conteúdo (ou o total disponível, se menor)
                const capConteudo = Math.min(5, total);
                if (v > capConteudo) v = capConteudo;
                // Não deixa a soma ultrapassar o total do simulado
                const alvo = parseInt(document.getElementById('sim-total-input').value, 10) || 0;
                let somaOutros = 0;
                document.querySelectorAll('#simulado-tree .conteudo-row').forEach(r2 => {
                    if (r2 === row) return;
                    if (r2.querySelector('.sim-cb').checked) somaOutros += parseInt(r2.querySelector('.sim-qty').value, 10) || 0;
                });
                if (somaOutros + v > alvo) v = Math.max(0, alvo - somaOutros);
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

// Distribui o total do simulado entre os conteúdos SELECIONADOS, de forma
// proporcional à quantidade de questões disponíveis em cada um, com teto de
// 5 por conteúdo e somando no máximo o total pedido. Usa o método de maior
// média (D'Hondt): a cada passo dá +1 ao conteúdo com maior disponível/(atual+1),
// respeitando o teto — o que evita que um capítulo com muitas questões domine.
function distribuirQuantidadesSimulado() {
    const target = parseInt(document.getElementById('sim-total-input').value, 10) || 0;
    const rows = Array.from(document.querySelectorAll('#simulado-tree .conteudo-row'));
    const sel = [];
    rows.forEach(r => {
        const qtyEl = r.querySelector('.sim-qty');
        if (r.querySelector('.sim-cb').checked) {
            const max = parseInt(r.dataset.max, 10) || 0;
            sel.push({ qtyEl, peso: max, cap: Math.min(5, max), q: 0 });
        } else {
            qtyEl.value = '0';
        }
    });
    if (sel.length) {
        let restante = Math.min(target, sel.reduce((s, o) => s + o.cap, 0));
        // 1) Garante ao menos 1 questão por conteúdo selecionado (se o total permitir),
        //    para que todo conteúdo marcado apareça no simulado.
        for (const o of sel) {
            if (restante <= 0) break;
            if (o.cap > 0) { o.q = 1; restante--; }
        }
        // 2) Distribui o restante proporcionalmente (maior média), respeitando o teto.
        while (restante > 0) {
            let melhor = null;
            for (const o of sel) {
                if (o.q >= o.cap) continue;
                const media = o.peso / (o.q + 1);
                if (!melhor || media > melhor.media || (media === melhor.media && o.q < melhor.o.q)) {
                    melhor = { o, media };
                }
            }
            if (!melhor) break; // todos no teto
            melhor.o.q++;
            restante--;
        }
        sel.forEach(o => { o.qtyEl.value = String(o.q); });
    }
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
    // Válido enquanto houver questões e a soma não passar do total pedido.
    // (O teto de 5 por conteúdo pode deixar a soma abaixo do total — é permitido.)
    const valido = soma > 0 && soma <= target;
    summary.classList.toggle('is-error', soma > target);
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
    
    // Botão de exclusão (somente admin)
    const btnExcluir = document.getElementById('btn-excluir-questao');
    if (btnExcluir) btnExcluir.style.display = isAdmin ? 'inline-flex' : 'none';

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
    
    // Migrar formato antigo ou inicializar novo (cada entrada conta tentativas,
    // acertos e erros para que o total de resoluções some cada resposta).
    let histAtual = historicoQuestoes[q.id];
    if (typeof histAtual === 'string') {
        histAtual = { status: histAtual, tentativas: 1, acertos: histAtual === 'acerto' ? 1 : 0, erros: histAtual === 'erro' ? 1 : 0 };
    } else if (!histAtual) {
        histAtual = { status: '', tentativas: 0, acertos: 0, erros: 0 };
    } else {
        // objeto legado sem acertos/erros: estima pelo status antes de somar a nova tentativa
        if (typeof histAtual.acertos !== 'number') histAtual.acertos = histAtual.status === 'acerto' ? (histAtual.tentativas || 0) : 0;
        if (typeof histAtual.erros !== 'number') histAtual.erros = histAtual.status === 'erro' ? (histAtual.tentativas || 0) : 0;
    }

    histAtual.status = isAcerto ? 'acerto' : 'erro';
    histAtual.tentativas += 1;
    if (isAcerto) histAtual.acertos += 1; else histAtual.erros += 1;

    // Log detalhado das minhas resoluções (data/hora, letra marcada, acertou?).
    // Campos curtos (t/l/a) p/ economizar espaço; mantém só as últimas 100.
    if (!Array.isArray(histAtual.log)) histAtual.log = [];
    histAtual.log.push({ t: Date.now(), l: letraEscolhida, a: isAcerto });
    if (histAtual.log.length > 100) histAtual.log = histAtual.log.slice(-100);

    historicoQuestoes[q.id] = histAtual;
    salvarHistorico();

    // Registra a resolução no agregado anônimo da questão (distribuição de
    // respostas + taxa de acerto de todos os alunos). Fire-and-forget: se a API
    // estiver indisponível (uso local/offline), não atrapalha a resposta.
    registrarResolucaoAgregada(q.id, letraEscolhida, isAcerto);
    
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

// Salta para uma questão aleatória do caderno atual (atalho: tecla R), em vez de
// seguir a ordem. Evita repetir a questão que já está na tela.
function questaoAleatoria() {
    const n = simuladoAtual.length;
    if (n <= 1) { proximaQuestao(); return; }
    let novo = questaoAtualIndex;
    while (novo === questaoAtualIndex) {
        novo = Math.floor(Math.random() * n);
    }
    questaoAtualIndex = novo;
    carregarQuestaoUI();
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

// ADMIN: exclui a questão atual da base (lista global no servidor) com confirmação
async function excluirQuestaoAtual() {
    if (!isAdmin) return;
    const q = simuladoAtual[questaoAtualIndex];
    if (!q) return;

    const trecho = (q.enunciado || '').slice(0, 140);
    if (!confirm(`Excluir a questão ID ${q.id} (${q.disciplina}) da base de questões?\n\n"${trecho}..."\n\nEla deixará de aparecer para todos os usuários. (Você pode recriar depois.)`)) {
        return;
    }

    const btn = document.getElementById('btn-excluir-questao');
    if (btn) btn.disabled = true;

    let persistiu = false;
    try {
        const resp = await fetch('/api/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Admin': ADMIN_USER },
            body: JSON.stringify({ action: 'delete', id: q.id })
        });
        persistiu = resp.ok;
    } catch (e) {
        persistiu = false;
    }

    // Atualiza o estado local (no Vercel já persistiu no servidor; localmente fica só em memória)
    questoesExcluidasSet.add(q.id);
    bancoQuestoes = bancoQuestoes.filter(x => x.id !== q.id);
    simuladoAtual.splice(questaoAtualIndex, 1);
    atualizarTelaDashboard();
    if (btn) btn.disabled = false;

    if (!persistiu) {
        alert('Atenção: a exclusão foi aplicada apenas nesta sessão (servidor indisponível). No site publicado a exclusão é permanente.');
    }

    // Avança a navegação do caderno
    if (simuladoAtual.length === 0) {
        alert('Questão excluída. Não há mais questões neste caderno.');
        showView('dashboard');
        return;
    }
    if (questaoAtualIndex >= simuladoAtual.length) {
        questaoAtualIndex = simuladoAtual.length - 1;
    }
    carregarQuestaoUI();
}

// ==========================================
// ESTATÍSTICAS DA QUESTÃO (distribuição entre alunos + minhas resoluções)
// ==========================================

// Envia (fire-and-forget) a resolução ao agregado anônimo da questão. Se a API
// estiver indisponível (uso local/offline), apenas ignora — não trava a resposta.
function registrarResolucaoAgregada(id, letra, acerto) {
    try {
        fetch(`${VERCEL_API_URL}/api/qstats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, letra, acerto })
        }).catch(() => {});
    } catch (e) { /* offline/local: ignora */ }
}

function fecharEstatisticasQuestao() {
    const overlay = document.getElementById('modal-qstats');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
}

async function abrirEstatisticasQuestao() {
    const q = simuladoAtual[questaoAtualIndex];
    if (!q) return;
    const overlay = document.getElementById('modal-qstats');
    if (!overlay) return;

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');

    const elDist = document.getElementById('qstats-distribuicao');
    const elTaxa = document.getElementById('qstats-taxa');
    const elMinhas = document.getElementById('qstats-minhas');

    elDist.innerHTML = '<p class="qstats-loading"><i class="ph ph-spinner ph-spin"></i> Carregando estatísticas dos alunos...</p>';
    elTaxa.textContent = '';

    // Minhas resoluções (local, sempre disponível)
    renderMinhasResolucoes(q, elMinhas);

    // Agregado entre alunos (servidor)
    let agg = null;
    try {
        const resp = await fetch(`${VERCEL_API_URL}/api/qstats?id=${encodeURIComponent(q.id)}`);
        if (resp.ok) agg = await resp.json();
    } catch (e) { agg = null; }

    renderDistribuicao(q, agg, elDist, elTaxa);
}

function renderDistribuicao(q, agg, elDist, elTaxa) {
    if (!agg) {
        elDist.innerHTML = '<p class="qstats-empty">Não foi possível carregar as estatísticas dos alunos agora.</p>';
        elTaxa.textContent = '';
        return;
    }
    const total = agg.total || 0;
    if (total === 0) {
        elDist.innerHTML = '<p class="qstats-empty">Ainda não há resoluções de alunos nesta questão. A contagem começa a partir de agora.</p>';
        elTaxa.textContent = '';
        return;
    }
    const correta = q.resposta_correta;
    const letras = ['A', 'B', 'C', 'D'].filter(L => q.alternativas && q.alternativas[L] !== undefined);
    let html = '';
    letras.forEach(L => {
        const n = agg[L] || 0;
        const pct = Math.round((n / total) * 100);
        const isCorreta = L === correta;
        html += `
            <div class="qstats-bar-row ${isCorreta ? 'is-correct' : ''}">
                <span class="qstats-bar-letra">${L}${isCorreta ? ' <i class="ph ph-check-circle"></i>' : ''}</span>
                <div class="qstats-bar-track"><div class="qstats-bar-fill" style="width:${pct}%;"></div></div>
                <span class="qstats-bar-num">${pct}% <small>(${n})</small></span>
            </div>`;
    });
    elDist.innerHTML = html;

    const taxa = Math.round((agg.acertos / total) * 100);
    elTaxa.innerHTML = `<i class="ph ph-target"></i> Taxa de acerto: <strong>${taxa}%</strong> <small>(${agg.acertos}/${total} resoluções)</small>`;
}

function renderMinhasResolucoes(q, el) {
    const h = historicoQuestoes[q.id];
    const r = resolucoesDaEntrada(h);
    const log = (h && Array.isArray(h.log)) ? h.log.slice() : [];
    log.sort((a, b) => (b.t || 0) - (a.t || 0));

    const header = `<div class="qstats-minhas-head"><i class="ph ph-clock-counter-clockwise"></i> Minhas resoluções: <strong>${r.tentativas}</strong></div>`;

    if (log.length === 0) {
        const extra = r.tentativas > 0
            ? '<p class="qstats-empty">Você já resolveu esta questão, mas o registro com data/hora só passou a ser guardado a partir de agora.</p>'
            : '<p class="qstats-empty">Você ainda não resolveu esta questão.</p>';
        el.innerHTML = header + extra;
        return;
    }

    let nota = '';
    if (r.tentativas > log.length) {
        nota = `<p class="qstats-note">Mostrando as últimas ${log.length} resoluções (registro detalhado a partir de agora).</p>`;
    }

    let rows = '';
    log.forEach(item => {
        const d = new Date(item.t || 0);
        const data = isNaN(d.getTime()) ? '—' : d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const ok = !!item.a;
        rows += `
            <li class="qstats-res-item ${ok ? 'ok' : 'err'}">
                <i class="ph ${ok ? 'ph-check-circle' : 'ph-x-circle'} qstats-res-icon"></i>
                <span class="qstats-res-data">${data}</span>
                <span class="qstats-res-letra">Marcou ${item.l || '—'}</span>
                <span class="qstats-res-status">${ok ? 'Acertou' : 'Errou'}</span>
            </li>`;
    });
    el.innerHTML = header + nota + `<ul class="qstats-res-list">${rows}</ul>`;
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
        if (typeof window.atualizarEstiloDisciplinasMateriais === 'function') window.atualizarEstiloDisciplinasMateriais();
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

    // Referência ao botão "Marcar como Estudado" injetado no fim do capítulo (espelha o do topo)
    let btnEstudadoInjetado = null;
    const estilizarBtnEstudadoInjetado = (studied) => {
        if (!btnEstudadoInjetado) return;
        if (studied) {
            btnEstudadoInjetado.style.background = 'linear-gradient(135deg, #047857 0%, #10b981 100%)';
            btnEstudadoInjetado.innerHTML = '<div style="color:#fff;font-size:17px;font-weight:700;">✔ Capítulo Estudado</div><div style="color:rgba(255,255,255,0.88);font-size:13px;">Clique para desmarcar</div>';
        } else {
            btnEstudadoInjetado.style.background = 'linear-gradient(135deg, #334155 0%, #475569 100%)';
            btnEstudadoInjetado.innerHTML = '<div style="color:#fff;font-size:17px;font-weight:700;">✓ Marcar como Estudado</div><div style="color:rgba(255,255,255,0.88);font-size:13px;">Concluir este capítulo sem voltar ao topo</div>';
        }
    };

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
        'ipo_3': {
            path: 'IPO_3',
            capitulos: [
                { titulo: 'Introdução - IPO III e o Manual de Planejamento Operacional', arquivo: 'Capitulo_00.html' },
                { titulo: 'Capítulo 1 - Doutrina de Planejamento Operacional', arquivo: 'Capitulo_01.html' },
                { titulo: 'Capítulo 2 - Cadeia de Custódia', arquivo: 'Capitulo_02.html' },
                { titulo: 'Capítulo 3 - Premissas Balizadoras da Atividade Investigatória Ostensiva', arquivo: 'Capitulo_03.html' },
                { titulo: 'Capítulo 4 - Representações para a Deflagração de Operação Policial', arquivo: 'Capitulo_04.html' },
                { titulo: 'Capítulo 5 - Preparação da Ação', arquivo: 'Capitulo_05.html' },
                { titulo: 'Capítulo 6 - Desencadeamento da Ação', arquivo: 'Capitulo_06.html' },
                { titulo: 'Capítulo 7 - Exploração de Documentos e Mídias (DOMEX)', arquivo: 'Capitulo_07.html' },
                { titulo: 'Capítulo 8 - Tratamento Pós-Ação', arquivo: 'Capitulo_08.html' },
                { titulo: 'Capítulo 9 - Destinação de Coisas Apreendidas (e Conclusão)', arquivo: 'Capitulo_09.html' }
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

    // Mapeamento: chave do materialData → disciplina(s) no banco de questões
    const materialToQuestoes = {
        'criminalistica': ['Criminalística'],
        'ipo': ['Investigação Policial (IPO)'],
        'ipo_2': ['Investigação Policial II (IPO II)'],
        'ipo_3': ['Investigação Policial III (IPO III)'],
        'bal': ['PCEB - Balística Forense'],
        'pceb': ['PCEB - Bombas e Explosivos'],
        'quimica_forense': ['PCEB - Química Forense'],
        'pvat_mod_1': ['PVAT - Módulo I (Identificação Veicular)'],
        'pvat_mod_2': ['PVAT - Módulo II (Acidentes de Tráfego)'],
        'loc': ['LOC - Locais de Crime e suas Interfaces']
    };

    // Busca questões que correspondem a uma disciplina de material + capítulo
    function buscarQuestoesDoCapitulo(discKey, capIndex) {
        const discNames = materialToQuestoes[discKey] || [];
        if (discNames.length === 0 || typeof bancoQuestoes === 'undefined') return [];

        const caps = materialData[discKey]?.capitulos;
        if (!caps || capIndex < 0 || capIndex >= caps.length) return [];

        const capObj = caps[capIndex];
        const capTitulo = typeof capObj === 'string' ? capObj : capObj.titulo;

        // Extrai o número do capítulo do título
        const capNumMatch = capTitulo.match(/(\d+)/);
        const capNum = capNumMatch ? parseInt(capNumMatch[1]) : (capIndex + 1);

        // Busca questões que são da mesma disciplina e cujo conteúdo menciona o mesmo número de capítulo
        const capPrefix = `Cap. ${capNum} -`;
        return bancoQuestoes.filter(q =>
            discNames.includes(q.disciplina) && q.conteudo && q.conteudo.startsWith(capPrefix)
        );
    }

    carregarMaterialEstudado();

    // --- Disciplina concluída: todos os capítulos marcados como estudados ---
    function arquivoDoCapitulo(cap, idx) {
        if (typeof cap === 'string') {
            return `Capitulo_${String(idx + 1).padStart(2, '0')}.html`;
        }
        return cap.arquivo;
    }
    function disciplinaConcluida(discValue) {
        const disc = materialData[discValue];
        if (!disc || !Array.isArray(disc.capitulos) || disc.capitulos.length === 0) return false;
        return disc.capitulos.every((cap, idx) =>
            !!materialEstudado[getMaterialKey(discValue, arquivoDoCapitulo(cap, idx))]);
    }
    // Aplica ✅ + verde nas disciplinas 100% concluídas (lista suspensa)
    function atualizarEstiloDisciplinas() {
        if (!matDisc) return;
        Array.from(matDisc.options).forEach(opt => {
            if (!opt.value || opt.disabled) return;
            const base = opt.textContent.replace(/^✅ /, '');
            if (disciplinaConcluida(opt.value)) {
                opt.textContent = '✅ ' + base;
                opt.style.color = '#10b981';
                opt.style.fontWeight = '600';
            } else {
                opt.textContent = base;
                opt.style.color = '';
                opt.style.fontWeight = '';
            }
        });
    }
    // Exposto para o switchMainTab atualizar ao abrir a aba Materiais
    window.atualizarEstiloDisciplinasMateriais = atualizarEstiloDisciplinas;
    atualizarEstiloDisciplinas();

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
            btnEstudadoInjetado = null; // evita referência ao botão do capítulo anterior

            // Força o iframe a ficar pequeno para não herdar a altura gigante do capítulo anterior
            iframe.style.height = '200px';
            // Reseta a referência do último tamanho conhecido
            iframe.dataset.lastHeight = '0';
            
            iframe.onload = () => {
                statusMsg.style.display = 'none';
                iframe.style.opacity = '1';

                // Aplica o tema (claro/escuro) ao conteúdo do material
                aplicarTemaIframeMaterial();

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

                    // Injeta botão "Marcar como Estudado" no final do material (espelha o do topo)
                    const containerEst = doc.querySelector('.container') || doc.body;
                    const btnEst = doc.createElement('div');
                    btnEst.style.cssText = 'margin: 40px 0 10px; padding: 18px 24px; border-radius: 12px; text-align: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.18);';
                    btnEstudadoInjetado = btnEst;
                    estilizarBtnEstudadoInjetado(!!materialEstudado[getMaterialKey(matDisc.value, matCap.value)]);
                    btnEst.addEventListener('mouseenter', () => { btnEst.style.transform = 'translateY(-2px)'; });
                    btnEst.addEventListener('mouseleave', () => { btnEst.style.transform = ''; });
                    btnEst.addEventListener('click', () => {
                        if (!matDisc.value || !matCap.value) return;
                        const key = getMaterialKey(matDisc.value, matCap.value);
                        if (materialEstudado[key]) delete materialEstudado[key]; else materialEstudado[key] = true;
                        salvarMaterialEstudado();
                        atualizarBotaoEstudado(matDisc.value, matCap.value);
                        atualizarEstiloOpcoes(matCap, matDisc.value);
                        atualizarEstiloDisciplinas();
                        estilizarBtnEstudadoInjetado(!!materialEstudado[key]);
                    });
                    containerEst.appendChild(btnEst);
                    setTimeout(() => {
                        const h = containerEst.offsetHeight + 40;
                        window.parent.postMessage({ type: 'resize-iframe', height: h }, '*');
                    }, 200);

                    // Injeta link "Praticar Questões" no final do material
                    const currentDiscKey = matDisc.value;
                    const currentFileName = matCap.value;
                    const caps = materialData[currentDiscKey]?.capitulos || [];
                    const capIdx = caps.findIndex((c, i) => {
                        const arq = typeof c === 'string'
                            ? `Capitulo_${String(i + 1).padStart(2, '0')}.html`
                            : c.arquivo;
                        return arq === currentFileName;
                    });

                    const questoesDoCapitulo = buscarQuestoesDoCapitulo(currentDiscKey, capIdx);
                    if (questoesDoCapitulo.length > 0) {
                        const container = doc.querySelector('.container') || doc.body;
                        const linkDiv = doc.createElement('div');
                        linkDiv.style.cssText = 'margin: 40px 0 20px; padding: 20px 24px; background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); border-radius: 12px; text-align: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);';
                        linkDiv.innerHTML = `
                            <div style="color: white; font-size: 18px; font-weight: 700; margin-bottom: 4px;">📝 Praticar Questões deste Capítulo</div>
                            <div style="color: rgba(255,255,255,0.85); font-size: 14px;">${questoesDoCapitulo.length} questões disponíveis sobre este conteúdo</div>
                        `;
                        linkDiv.addEventListener('mouseenter', () => {
                            linkDiv.style.transform = 'translateY(-2px)';
                            linkDiv.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.4)';
                        });
                        linkDiv.addEventListener('mouseleave', () => {
                            linkDiv.style.transform = '';
                            linkDiv.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.3)';
                        });
                        linkDiv.addEventListener('click', () => {
                            window.parent.postMessage({
                                type: 'start-questoes-capitulo',
                                discKey: currentDiscKey,
                                capIndex: capIdx
                            }, '*');
                        });
                        container.appendChild(linkDiv);

                        // Recalcula altura após inserção
                        setTimeout(() => {
                            const h = container.offsetHeight + 40;
                            window.parent.postMessage({ type: 'resize-iframe', height: h }, '*');
                        }, 200);
                    }
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
            atualizarEstiloDisciplinas();
            estilizarBtnEstudadoInjetado(!!materialEstudado[key]);
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

        // Handler: clicou em "Praticar Questões" dentro do material
        if (event.data && event.data.type === 'start-questoes-capitulo') {
            const { discKey, capIndex } = event.data;
            const questoes = buscarQuestoesDoCapitulo(discKey, capIndex);
            if (questoes.length === 0) {
                alert('Nenhuma questão encontrada para este capítulo.');
                return;
            }

            // Embaralha
            const shuffled = [...questoes].sort(() => Math.random() - 0.5);

            // Configura o caderno
            simuladoAtual = shuffled;
            resetarEstadoSessao(simuladoAtual);
            questaoAtualIndex = 0;
            acertosSimulado = 0;
            errosSimulado = 0;

            const discNames = materialToQuestoes[discKey] || [];
            document.getElementById('quiz-disciplina-badge').textContent =
                discNames.length === 1 ? discNames[0] : 'Questões do capítulo';

            carregarQuestaoUI();
            showView('quiz');

            // Scroll para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
        case 'ultimo_acesso': return u.lastAccessAt || '';
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
        { key: 'ultimo_acesso', label: 'Último Acesso' }
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
        const reqDate = u.lastAccessAt ? new Date(u.lastAccessAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

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
let notesView = 'list'; // 'list' (padrão) | 'cards'
try { const v = localStorage.getItem('pcpr_notes_view'); if (v === 'cards' || v === 'list') notesView = v; } catch (e) {}

// Aplica o modo de visualização (lista detalhada x cards) ao container e aos botões
function notesAplicarView() {
    const cont = document.getElementById('notes-list');
    if (cont) {
        cont.classList.toggle('as-list', notesView === 'list');
        cont.classList.toggle('as-cards', notesView === 'cards');
    }
    const bl = document.getElementById('btn-notes-view-list');
    const bc = document.getElementById('btn-notes-view-cards');
    if (bl) bl.classList.toggle('active', notesView === 'list');
    if (bc) bc.classList.toggle('active', notesView === 'cards');
}

function notesSetView(v) {
    notesView = (v === 'cards') ? 'cards' : 'list';
    try { localStorage.setItem('pcpr_notes_view', notesView); } catch (e) {}
    notesAplicarView();
}

async function salvarAnotacoesStore() {
    localStorage.setItem('pcpr_notes', JSON.stringify(anotacoes));
    // Anotações são salvas imediatamente na nuvem (sem debounce)
    // para evitar perda de dados ao fechar o browser
    if (!currentUser) return;
    try {
        const payload = {
            stats: stats,
            favoritos: favoritos,
            comentarios: comentarios,
            historico: historicoQuestoes,
            progresso: progressoCurso,
            agendaAplicada: JSON.parse(localStorage.getItem('pcpr_agenda_aplicada') || '{}'),
            materialEstudado: materialEstudado,
            flashcards: (typeof flashcards !== 'undefined' ? flashcards : []),
            anotacoes: anotacoes
        };
        await fetch(`${VERCEL_API_URL}/api/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser, data: payload })
        });
        console.log('Anotação salva na nuvem!');
    } catch (e) {
        console.error('Falha ao salvar anotação na nuvem. Dado seguro no localStorage.', e);
    }
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
    return [...new Set(bancoQuestoes.map(q => q.disciplina))].filter(d => disciplinaPermitidaParaCargo(d)).sort();
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
    notesAplicarView();
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

    notesAplicarView();

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
        const snippet = (n.texto || '').slice(0, 220);
        card.innerHTML = `
            <div class="note-card-main">
                <div class="note-card-title">${notesEsc(n.titulo || 'Sem título')}</div>
                ${tags.length ? `<div class="note-card-tags">${tags.join('')}</div>` : ''}
                <div class="note-card-snippet">${snippet ? notesEsc(snippet) : '<em>(sem texto)</em>'}</div>
            </div>
            <div class="note-card-footer">
                <span class="note-card-date"><i class="ph ph-clock"></i> ${notesFmtData(n.atualizadoEm)}</span>
                <div class="note-card-actions">
                    <button title="Visualizar (abre em nova aba)" data-view="${n.id}"><i class="ph ph-eye"></i></button>
                    <button title="Editar" data-edit="${n.id}"><i class="ph ph-pencil-simple"></i></button>
                    <button class="danger" title="Excluir" data-del="${n.id}"><i class="ph ph-trash"></i></button>
                </div>
            </div>`;
        card.addEventListener('click', (e) => {
            if (e.target.closest('[data-del]')) { e.stopPropagation(); notesExcluir(n.id); return; }
            if (e.target.closest('[data-view]')) { e.stopPropagation(); notesAbrirVisualizacao(n.id); return; }
            notesAbrirEditor(n.id);
        });
        cont.appendChild(card);
    });
}

// Abre a anotação para LEITURA (sem editar), num documento próprio em nova aba.
function notesAbrirVisualizacao(id) {
    const note = anotacoes.find(n => n.id === id);
    if (!note) return;
    const titulo = note.titulo || 'Anotação';
    const tags = [];
    if (note.disciplina) tags.push(note.disciplina);
    if (note.conteudo) tags.push(note.conteudo);
    const corpo = note.html || (note.texto ? '<p>' + notesEsc(note.texto) + '</p>' : '<p><em>(sem conteúdo)</em></p>');
    const docHtml = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${notesEsc(titulo)}</title>
<style>
  :root { color-scheme: light; }
  body { font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #1e293b; background: #f1f5f9; margin: 0; padding: 24px; }
  .wrap { max-width: 820px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 6px 24px rgba(0,0,0,0.08); padding: 32px 40px; }
  h1 { font-size: 1.85rem; margin: 0 0 8px; color: #0f172a; }
  .meta { color: #64748b; font-size: .85rem; margin-bottom: 18px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .tag { background: #eef2ff; color: #3730a3; border-radius: 999px; padding: 3px 10px; font-weight: 600; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0 24px; }
  .corpo { font-size: 1.02rem; }
  .corpo img { max-width: 100%; height: auto; border-radius: 8px; }
  .corpo blockquote { border-left: 4px solid #cbd5e1; margin: 12px 0; padding: 4px 16px; color: #475569; }
  .corpo a { color: #2563eb; }
  .corpo table { border-collapse: collapse; }
  .corpo td, .corpo th { border: 1px solid #e2e8f0; padding: 8px; }
  @media print { body { background: #fff; padding: 0; } .wrap { box-shadow: none; max-width: none; } }
</style></head>
<body><div class="wrap">
  <h1>${notesEsc(titulo)}</h1>
  <div class="meta">${tags.map(t => '<span class="tag">' + notesEsc(t) + '</span>').join('')}<span><i></i>Atualizada em ${notesFmtData(note.atualizadoEm)}</span></div>
  <hr>
  <div class="corpo">${corpo}</div>
</div></body></html>`;
    const blob = new Blob([docHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) { alert('Não foi possível abrir a aba (verifique o bloqueador de pop-ups).'); }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
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
    // Guarda a rolagem para restaurar depois (evita o "pulo" para o topo da página
    // ao focar/aplicar formatação num editor alto que rola por dentro).
    const winY = window.scrollY;
    const edTop = editor.scrollTop;
    editor.focus({ preventScroll: true });
    if (notesSavedRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(notesSavedRange);
    }
    try { document.execCommand(cmd, false, value == null ? null : value); } catch (e) {}
    notesAtualizarBotoesRT();
    // Restaura a posição de rolagem (a janela não deve saltar; o editor mantém o ponto)
    editor.scrollTop = edTop;
    if (window.scrollY !== winY) window.scrollTo({ top: winY });
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
    document.getElementById('btn-notes-view-list').addEventListener('click', () => notesSetView('list'));
    document.getElementById('btn-notes-view-cards').addEventListener('click', () => notesSetView('cards'));
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
    // Mantém a seleção no editor ao clicar nos botões/amostras (não nos inputs de cor)
    toolbar.addEventListener('mousedown', (e) => {
        if (e.target.closest('.rt-btn, .rt-swatch')) e.preventDefault();
    });
    toolbar.querySelectorAll('.rt-btn[data-cmd]').forEach(btn =>
        btn.addEventListener('click', () => notesExecRT(btn.dataset.cmd)));
    toolbar.querySelectorAll('.rt-btn[data-block]').forEach(btn =>
        btn.addEventListener('click', () => notesExecRT('formatBlock', btn.dataset.block)));
    // Amostras de cor (texto e marca-texto) — aplicação em 1 clique
    toolbar.querySelectorAll('.rt-swatch[data-cmd]').forEach(btn =>
        btn.addEventListener('click', () => notesExecRT(btn.dataset.cmd, btn.dataset.color)));
    const fmt = document.getElementById('rt-format');
    fmt.addEventListener('change', () => { notesExecRT('formatBlock', fmt.value); fmt.selectedIndex = 0; });
    // 'change' (e não 'input') aplica a cor uma única vez, ao confirmar no seletor
    document.getElementById('rt-forecolor').addEventListener('change', (e) => notesExecRT('foreColor', e.target.value));
    document.getElementById('rt-hilite').addEventListener('change', (e) => notesExecRT('hiliteColor', e.target.value));
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
