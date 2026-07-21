// ==========================================
// CADERNOS SALVOS
// Guarda cada caderno gerado (nome, questões, onde parou e o que já foi
// respondido) para retomar depois. Só os IDs das questões são gravados — os
// objetos vêm do banco na hora de abrir, então o storage fica enxuto e o
// caderno acompanha correções feitas na base.
// ==========================================

const CAD_STORAGE_KEY = 'pcpr_cadernos';

let cadernos = [];           // lista salva (mais recente primeiro)
let cadernoAtualId = null;   // caderno sendo resolvido agora (null = sessão avulsa)
let cadernoPendente = null;  // caderno gerado que ainda não teve resposta nenhuma

// ------------------------------------------
// STORE
// ------------------------------------------
function cadernosCarregar() {
    try {
        const raw = JSON.parse(localStorage.getItem(CAD_STORAGE_KEY) || '[]');
        cadernos = Array.isArray(raw) ? raw.map(cadernoNormalizar).filter(Boolean) : [];
    } catch (e) {
        cadernos = [];
    }
    cadernosOrdenar();
}

// Preenche campos ausentes (cadernos vindos de versões anteriores ou da nuvem)
function cadernoNormalizar(c) {
    if (!c || !c.id || !Array.isArray(c.questaoIds)) return null;
    c.nome = c.nome || 'Caderno sem nome';
    c.tipo = c.tipo === 'simulado' ? 'simulado' : 'caderno';
    c.disciplinas = Array.isArray(c.disciplinas) ? c.disciplinas : [];
    c.respostas = (c.respostas && typeof c.respostas === 'object') ? c.respostas : {};
    c.rodadas = Array.isArray(c.rodadas) ? c.rodadas : [];
    c.posicao = typeof c.posicao === 'number' ? c.posicao : 0;
    c.criadoEm = c.criadoEm || Date.now();
    c.atualizadoEm = c.atualizadoEm || c.criadoEm;
    return c;
}

function cadernosOrdenar() {
    cadernos.sort((a, b) => (b.atualizadoEm || 0) - (a.atualizadoEm || 0));
}

// render = false nas gravações de rotina (posição), que não mudam a lista
function cadernosSalvar(render = true) {
    try {
        localStorage.setItem(CAD_STORAGE_KEY, JSON.stringify(cadernos));
    } catch (e) {
        console.error('Falha ao salvar cadernos no localStorage', e);
    }
    if (typeof requestCloudSync === 'function') requestCloudSync();
    if (render) renderCadernosPainel();
}

function cadernoObter(id) {
    return cadernos.find(c => c.id === id) || null;
}

function cadernoNovoId() {
    return 'cad_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ------------------------------------------
// SESSÃO (integração com o quiz)
// ------------------------------------------

// Nome sugerido no momento da criação — o usuário renomeia depois se quiser
function cadernoNomeSugerido(disciplinas, conteudos) {
    const data = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const discs = disciplinas || [];
    const conts = conteudos || [];

    let base = 'Caderno';
    if (discs.length === 1) base = discs[0];
    else if (discs.length > 1) base = `${discs.length} disciplinas`;

    let detalhe = '';
    if (conts.length === 1) detalhe = ` · ${conts[0]}`;
    else if (conts.length > 1) detalhe = ` · ${conts.length} conteúdos`;

    return `${base}${detalhe} · ${data}`;
}

// Chamado ao gerar um caderno/simulado. O caderno fica "pendente": só entra na
// lista quando a primeira questão for respondida, para não encher o painel de
// cadernos que o usuário abriu e fechou sem responder nada.
function cadernoIniciarSessao(opts) {
    const questoes = opts.questoes || [];
    cadernoAtualId = null;
    cadernoPendente = {
        id: cadernoNovoId(),
        nome: opts.nome || cadernoNomeSugerido(opts.disciplinas, opts.conteudos),
        tipo: opts.tipo || 'caderno',
        disciplinas: opts.disciplinas || [],
        questaoIds: questoes.map(q => q.id),
        posicao: 0,
        respostas: {},
        rodadas: [],
        criadoEm: Date.now(),
        atualizadoEm: Date.now()
    };
}

// Sessões avulsas (ex.: resolver questão por ID) não viram caderno
function cadernoEncerrarSessao() {
    cadernoAtualId = null;
    cadernoPendente = null;
}

function cadernoDaSessao() {
    return cadernoAtualId ? cadernoObter(cadernoAtualId) : null;
}

function cadernoRegistrarResposta(questaoId, letra, acertou) {
    let c = cadernoDaSessao();

    // Primeira resposta do caderno recém-gerado: agora ele vira um caderno salvo
    if (!c && cadernoPendente) {
        c = cadernoPendente;
        cadernos.unshift(c);
        cadernoAtualId = c.id;
        cadernoPendente = null;
    }
    if (!c) return;

    c.respostas[questaoId] = { l: letra, a: !!acertou, t: Date.now() };
    // Guarda a posição já aqui: se o app fechar logo após responder, o caderno
    // reabre na questão certa mesmo sem o usuário ter navegado adiante.
    if (typeof questaoAtualIndex === 'number') c.posicao = questaoAtualIndex;
    c.atualizadoEm = Date.now();
    cadernosSalvar();
}

function cadernoRegistrarPosicao(indice) {
    const c = cadernoDaSessao();
    if (!c || c.posicao === indice) return;
    c.posicao = indice;
    c.atualizadoEm = Date.now();
    cadernosSalvar(false);
}

// Reabre um caderno salvo: remonta as questões do banco, devolve as respostas
// já dadas e volta para onde o usuário parou.
function cadernoAbrir(id) {
    const c = cadernoObter(id);
    if (!c) return;

    const questoes = [];
    const faltando = [];
    c.questaoIds.forEach(qid => {
        const q = bancoQuestoes.find(x => x.id === qid);
        if (q) questoes.push(q); else faltando.push(qid);
    });

    if (questoes.length === 0) {
        alert('As questões deste caderno não estão mais disponíveis na base.\n\nEle pode ser excluído.');
        return;
    }
    if (faltando.length > 0) {
        alert(`${faltando.length} questão(ões) deste caderno saíram da base e foram removidas dele.`);
        c.questaoIds = questoes.map(q => q.id);
        faltando.forEach(qid => { delete c.respostas[qid]; });
        c.atualizadoEm = Date.now();
        cadernosSalvar(false);
    }

    // Devolve o estado de sessão de cada questão (os objetos são compartilhados
    // entre cadernos, por isso limpamos antes de reaplicar)
    resetarEstadoSessao(questoes);
    let ac = 0, er = 0;
    questoes.forEach(q => {
        const r = c.respostas[q.id];
        if (!r) return;
        q.foi_respondida_neste_simulado = true;
        q.letra_escolhida_neste_simulado = r.l;
        q.acertou_neste_simulado = !!r.a;
        if (r.a) ac++; else er++;
    });

    simuladoAtual = questoes;
    acertosSimulado = ac;
    errosSimulado = er;
    questaoAtualIndex = Math.min(Math.max(c.posicao || 0, 0), questoes.length - 1);
    cadernoAtualId = c.id;
    cadernoPendente = null;

    const badge = document.getElementById('quiz-disciplina-badge');
    if (badge) {
        badge.textContent = c.disciplinas.length === 1
            ? c.disciplinas[0]
            : (c.disciplinas.length > 1 ? `${c.disciplinas.length} disciplinas` : c.nome);
    }

    carregarQuestaoUI();
    showView('quiz');
}

// Arquiva a rodada atual nas estatísticas e recomeça o caderno do zero
function cadernoRefazer(id) {
    const c = cadernoObter(id);
    if (!c) return;

    const r = cadernoResumo(c);
    if (r.respondidas > 0) {
        const msg = `Refazer "${c.nome}"?\n\n` +
            `A rodada atual (${r.acertos} acertos em ${r.respondidas} respondidas) vai para o histórico ` +
            `de rodadas e o caderno recomeça do zero, com as mesmas ${r.total} questões.`;
        if (!confirm(msg)) return;

        c.rodadas.push({
            fim: Date.now(),
            acertos: r.acertos,
            erros: r.erros,
            respondidas: r.respondidas,
            total: r.total
        });
        c.respostas = {};
    }
    c.posicao = 0;
    c.atualizadoEm = Date.now();
    cadernosSalvar();
    cadernoAbrir(id);
}

function cadernoRenomear(id) {
    const c = cadernoObter(id);
    if (!c) return;
    const novo = prompt('Nome do caderno:', c.nome);
    if (novo === null) return;
    const limpo = novo.trim();
    if (!limpo) return;
    c.nome = limpo.slice(0, 80);
    c.atualizadoEm = Date.now();
    cadernosSalvar();
}

function cadernoExcluir(id) {
    const c = cadernoObter(id);
    if (!c) return;
    if (!confirm(`Excluir o caderno "${c.nome}"?\n\nO histórico geral de questões resolvidas é mantido — só este caderno some.`)) return;
    cadernos = cadernos.filter(x => x.id !== id);
    if (cadernoAtualId === id) cadernoAtualId = null;
    cadernosSalvar();
}

// ------------------------------------------
// ESTATÍSTICAS
// ------------------------------------------
function cadernoResumo(c) {
    const total = c.questaoIds.length;
    let acertos = 0, erros = 0;
    Object.keys(c.respostas).forEach(k => {
        if (c.respostas[k] && c.respostas[k].a) acertos++; else erros++;
    });
    const respondidas = acertos + erros;
    return {
        total,
        respondidas,
        acertos,
        erros,
        pct: respondidas > 0 ? Math.round((acertos / respondidas) * 100) : null,
        concluido: total > 0 && respondidas >= total
    };
}

function cadFmtQuando(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const hoje = new Date();
    const mesmoDia = (a, b) => a.toDateString() === b.toDateString();
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (mesmoDia(d, hoje)) return `hoje ${hora}`;
    const ontem = new Date(hoje.getTime() - 86400000);
    if (mesmoDia(d, ontem)) return `ontem ${hora}`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function cadEsc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function cadCorPct(pct) {
    if (pct === null) return 'var(--text-muted)';
    if (pct >= 70) return 'var(--success-color)';
    if (pct >= 50) return 'var(--warning-color)';
    return 'var(--error-color)';
}

// ------------------------------------------
// PAINEL NO DASHBOARD
// ------------------------------------------
function renderCadernosPainel() {
    const lista = document.getElementById('cadernos-lista');
    if (!lista) return;

    const contador = document.getElementById('cadernos-contador');
    if (contador) {
        contador.textContent = cadernos.length === 1 ? '1 salvo' : `${cadernos.length} salvos`;
        contador.style.display = cadernos.length ? 'inline-flex' : 'none';
    }

    if (cadernos.length === 0) {
        lista.innerHTML = `
            <div class="cad-vazio">
                <i class="ph ph-bookmarks-simple"></i>
                <p>Nenhum caderno salvo ainda.</p>
                <span>Gere um caderno acima e responda a primeira questão: ele aparece aqui
                automaticamente para você continuar depois de onde parou.</span>
            </div>`;
        return;
    }

    cadernosOrdenar();
    lista.innerHTML = cadernos.map(c => {
        const r = cadernoResumo(c);
        const pctBarra = r.total > 0 ? Math.round((r.respondidas / r.total) * 100) : 0;
        const rodada = c.rodadas.length + 1;
        const emAndamento = cadernoAtualId === c.id;

        const acerto = r.pct === null
            ? '<span class="cad-score vazio">—</span>'
            : `<span class="cad-score" style="color:${cadCorPct(r.pct)}">${r.pct}%</span>`;

        const meta = [
            c.tipo === 'simulado' ? 'Simulado' : null,
            `${r.total} questões`,
            c.rodadas.length > 0 ? `${rodada}ª rodada` : null,
            cadFmtQuando(c.atualizadoEm)
        ].filter(Boolean).join(' · ');

        return `
        <div class="cad-item${r.concluido ? ' is-concluido' : ''}">
            <div class="cad-main">
                <span class="cad-nome">${cadEsc(c.nome)}${emAndamento ? '<span class="cad-tag-atual">em andamento</span>' : ''}</span>
                <span class="cad-meta">${cadEsc(meta)}</span>
            </div>
            <div class="cad-prog">
                <div class="cad-bar"><div class="cad-bar-fill" style="width:${pctBarra}%"></div></div>
                <span class="cad-prog-label">${r.respondidas}/${r.total}</span>
            </div>
            ${acerto}
            <div class="cad-actions">
                <button type="button" class="btn-primary btn-sm" onclick="cadernoAbrir('${c.id}')">
                    <i class="ph ${r.concluido ? 'ph-eye' : 'ph-play'}"></i> ${r.concluido ? 'Revisar' : 'Continuar'}
                </button>
                <button type="button" class="btn-icon tooltip" data-tooltip="Refazer do zero (arquiva a rodada atual)" onclick="cadernoRefazer('${c.id}')">
                    <i class="ph ph-arrow-counter-clockwise"></i>
                </button>
                <button type="button" class="btn-icon tooltip" onclick="cadernoAbrirStats('${c.id}')" data-tooltip="Estatísticas do caderno">
                    <i class="ph ph-chart-line-up"></i>
                </button>
                <button type="button" class="btn-icon tooltip" data-tooltip="Renomear" onclick="cadernoRenomear('${c.id}')">
                    <i class="ph ph-pencil-simple"></i>
                </button>
                <button type="button" class="btn-icon tooltip cad-del" data-tooltip="Excluir caderno" onclick="cadernoExcluir('${c.id}')">
                    <i class="ph ph-trash"></i>
                </button>
            </div>
        </div>`;
    }).join('');
}

// ------------------------------------------
// MODAL DE ESTATÍSTICAS DO CADERNO
// ------------------------------------------
function cadernoAbrirStats(id) {
    const c = cadernoObter(id);
    const modal = document.getElementById('modal-caderno-stats');
    const corpo = document.getElementById('cad-stats-body');
    if (!c || !modal || !corpo) return;

    const r = cadernoResumo(c);

    // Evolução: rodadas fechadas + a rodada em curso
    const pontos = c.rodadas.map((rd, i) => ({
        rotulo: `Rodada ${i + 1}`,
        pct: rd.respondidas > 0 ? Math.round((rd.acertos / rd.respondidas) * 100) : 0,
        detalhe: `${rd.acertos}/${rd.respondidas} · ${cadFmtQuando(rd.fim)}`
    }));
    if (r.respondidas > 0) {
        pontos.push({
            rotulo: `Rodada ${c.rodadas.length + 1}${r.concluido ? '' : ' (em curso)'}`,
            pct: r.pct,
            detalhe: `${r.acertos}/${r.respondidas}${r.concluido ? '' : ` · ${r.total - r.respondidas} restantes`}`
        });
    }

    let evolucaoHtml;
    if (pontos.length === 0) {
        evolucaoHtml = '<p class="cad-stats-vazio">Nenhuma questão respondida ainda.</p>';
    } else {
        evolucaoHtml = pontos.map(p => `
            <div class="cad-rodada">
                <span class="cad-rodada-nome">${cadEsc(p.rotulo)}</span>
                <div class="cad-rodada-bar">
                    <div class="cad-rodada-fill" style="width:${p.pct}%; background:${cadCorPct(p.pct)}"></div>
                </div>
                <span class="cad-rodada-pct" style="color:${cadCorPct(p.pct)}">${p.pct}%</span>
                <span class="cad-rodada-det">${cadEsc(p.detalhe)}</span>
            </div>`).join('');

        if (pontos.length > 1) {
            const delta = pontos[pontos.length - 1].pct - pontos[0].pct;
            const sinal = delta > 0 ? '+' : '';
            const cor = delta > 0 ? 'var(--success-color)' : (delta < 0 ? 'var(--error-color)' : 'var(--text-muted)');
            const icone = delta > 0 ? 'ph-trend-up' : (delta < 0 ? 'ph-trend-down' : 'ph-minus');
            evolucaoHtml += `
                <p class="cad-evolucao" style="color:${cor}">
                    <i class="ph ${icone}"></i> ${sinal}${delta} pontos percentuais da primeira à última rodada
                </p>`;
        }
    }

    // Desempenho por conteúdo na rodada atual
    const porConteudo = {};
    c.questaoIds.forEach(qid => {
        const resp = c.respostas[qid];
        if (!resp) return;
        const q = bancoQuestoes.find(x => x.id === qid);
        const chave = q ? (q.conteudo || q.disciplina || 'Sem conteúdo') : 'Questão removida';
        if (!porConteudo[chave]) porConteudo[chave] = { acertos: 0, total: 0 };
        porConteudo[chave].total++;
        if (resp.a) porConteudo[chave].acertos++;
    });

    const chaves = Object.keys(porConteudo).sort();
    const conteudoHtml = chaves.length === 0
        ? '<p class="cad-stats-vazio">Responda algumas questões para ver o detalhamento.</p>'
        : chaves.map(k => {
            const d = porConteudo[k];
            const pct = Math.round((d.acertos / d.total) * 100);
            return `
                <div class="cad-conteudo-row">
                    <span class="cad-conteudo-nome">${cadEsc(k)}</span>
                    <span class="cad-conteudo-num">${d.acertos}/${d.total}</span>
                    <span class="cad-conteudo-pct" style="color:${cadCorPct(pct)}">${pct}%</span>
                </div>`;
        }).join('');

    corpo.innerHTML = `
        <p class="cad-stats-nome">${cadEsc(c.nome)}</p>
        <p class="cad-stats-sub">${r.total} questões · criado em ${cadFmtQuando(c.criadoEm)}</p>

        <section class="cad-stats-section">
            <h4>Rodada atual</h4>
            <div class="cad-stats-grid">
                <div><strong>${r.respondidas}/${r.total}</strong><span>respondidas</span></div>
                <div><strong class="success-text">${r.acertos}</strong><span>acertos</span></div>
                <div><strong class="error-text">${r.erros}</strong><span>erros</span></div>
                <div><strong style="color:${cadCorPct(r.pct)}">${r.pct === null ? '—' : r.pct + '%'}</strong><span>aproveitamento</span></div>
            </div>
        </section>

        <section class="cad-stats-section">
            <h4>Evolução por rodada</h4>
            ${evolucaoHtml}
        </section>

        <section class="cad-stats-section">
            <h4>Por conteúdo (rodada atual)</h4>
            ${conteudoHtml}
        </section>`;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
}

function cadernoFecharStats() {
    const modal = document.getElementById('modal-caderno-stats');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal-caderno-stats');
    if (modal) {
        modal.addEventListener('click', (e) => { if (e.target === modal) cadernoFecharStats(); });
    }
    const btnClose = document.getElementById('cad-stats-close');
    if (btnClose) btnClose.addEventListener('click', cadernoFecharStats);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) cadernoFecharStats();
    });
});
