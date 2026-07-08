// =====================================================================
// MARCA-TEXTO — aba Materiais (resumido e completo)
// Selecionou texto → paleta de cores → grifo persistente (localStorage +
// nuvem via requestCloudSync). Clique num grifo existente para recolorir
// ou remover. A última cor usada vira o padrão.
// Âncora dos grifos: trecho exato + contexto (prefixo/sufixo), refeita a
// cada carregamento — resiste a pequenas mudanças no material.
// =====================================================================
(function () {
    'use strict';

    const CORES = {
        amarelo: '#ffe08a',
        verde: '#b3e6a4',
        azul: '#a8d8ff',
        rosa: '#ffbcd6',
        roxo: '#d9c2ff'
    };
    const LS_DATA = 'pcpr_marcacoes';
    const LS_COR = 'pcpr_hl_cor';

    let corAtual = localStorage.getItem(LS_COR) || 'amarelo';
    if (!CORES[corAtual]) corAtual = 'amarelo';
    let marcaEditando = null;   // id do grifo em edição (null = modo "nova marcação")
    let popup = null;

    // ---------------- Contexto ----------------
    function getIframe() { return document.getElementById('material-iframe'); }

    function getDoc() {
        const f = getIframe();
        if (!f || !f.src) return null;
        try { return f.contentDocument || (f.contentWindow && f.contentWindow.document); }
        catch (e) { return null; }
    }

    function chaveCapitulo() {
        const d = document.getElementById('material-disciplina-select');
        const c = document.getElementById('material-capitulo-select');
        const f = getIframe();
        const versao = (f && /\/COMPLETO\//i.test(f.src)) ? 'completo' : 'resumido';
        if (d && c && d.value && c.value) return `${d.value}::${c.value}::${versao}`;
        return f ? f.src : '';
    }

    // ---------------- Armazenamento ----------------
    function lerTudo() {
        try { return JSON.parse(localStorage.getItem(LS_DATA) || '{}'); }
        catch (e) { return {}; }
    }

    function salvarTudo(dados) {
        localStorage.setItem(LS_DATA, JSON.stringify(dados));
        if (typeof requestCloudSync === 'function') { try { requestCloudSync(); } catch (e) { } }
    }

    function marcasDoCapitulo() { return lerTudo()[chaveCapitulo()] || []; }

    function gravarMarcas(lista) {
        const dados = lerTudo();
        const k = chaveCapitulo();
        if (lista.length) dados[k] = lista;
        else delete dados[k];
        salvarTudo(dados);
    }

    // ---------------- Mapa de texto do documento ----------------
    function construirMapa(doc) {
        const nodes = [];
        let full = '';
        const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
            acceptNode(n) {
                const p = n.parentNode && n.parentNode.nodeName;
                if (p === 'SCRIPT' || p === 'STYLE') return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        let n;
        while ((n = walker.nextNode())) {
            nodes.push({ node: n, start: full.length });
            full += n.data;
        }
        return { nodes, full };
    }

    function indiceGlobal(mapa, container, offset) {
        if (container.nodeType === 3) {
            for (const e of mapa.nodes) if (e.node === container) return e.start + offset;
            return -1;
        }
        // container é elemento: usa o início do primeiro nó de texto após o filho[offset]
        const filho = container.childNodes[offset];
        if (!filho) { // fim do elemento: procura o último texto interno
            for (let i = mapa.nodes.length - 1; i >= 0; i--) {
                if (container.contains(mapa.nodes[i].node)) return mapa.nodes[i].start + mapa.nodes[i].node.data.length;
            }
            return -1;
        }
        for (const e of mapa.nodes) if (filho === e.node || filho.contains(e.node)) return e.start;
        for (const e of mapa.nodes) if (container.contains(e.node) && e.start >= 0) return e.start;
        return -1;
    }

    function posParaNo(mapa, pos, fim) {
        for (const e of mapa.nodes) {
            const len = e.node.data.length;
            if (pos < e.start + len || (fim && pos === e.start + len)) {
                if (pos >= e.start) return { node: e.node, offset: pos - e.start };
            }
        }
        return null;
    }

    function localizar(mapa, m) {
        let idx = -1, melhor = -1, melhorScore = -1;
        while ((idx = mapa.full.indexOf(m.exact, idx + 1)) !== -1) {
            let score = 0;
            if (m.prefix && mapa.full.slice(Math.max(0, idx - m.prefix.length), idx) === m.prefix) score += 2;
            if (m.suffix && mapa.full.substr(idx + m.exact.length, m.suffix.length) === m.suffix) score += 2;
            if (score > melhorScore) { melhorScore = score; melhor = idx; }
            if (score === 4) break;
        }
        return melhor;
    }

    // ---------------- Aplicação visual ----------------
    function injetarEstilo(doc) {
        if (doc.getElementById('__hl_style')) return;
        const st = doc.createElement('style');
        st.id = '__hl_style';
        st.textContent =
            'mark.pcpr-hl{padding:0 1px;border-radius:3px;cursor:pointer;color:inherit;' +
            'transition:filter .15s;-webkit-box-decoration-break:clone;box-decoration-break:clone;}' +
            'mark.pcpr-hl:hover{filter:brightness(0.92);}';
        doc.head.appendChild(st);
    }

    function envolverRange(doc, range, id, cor) {
        // normaliza bordas para nós de texto inteiros
        if (range.startContainer.nodeType === 3 && range.startOffset > 0) {
            const novo = range.startContainer.splitText(range.startOffset);
            range.setStart(novo, 0);
        }
        if (range.endContainer.nodeType === 3 && range.endOffset < range.endContainer.data.length) {
            range.endContainer.splitText(range.endOffset);
        }
        const alvo = [];
        const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
        let t;
        while ((t = walker.nextNode())) {
            if (!t.data.trim()) continue;
            const r = doc.createRange();
            r.selectNodeContents(t);
            const dentroIni = range.compareBoundaryPoints(Range.START_TO_START, r) <= 0;
            const dentroFim = range.compareBoundaryPoints(Range.END_TO_END, r) >= 0;
            if (dentroIni && dentroFim) alvo.push(t);
        }
        for (const no of alvo) {
            if (no.parentNode && no.parentNode.classList && no.parentNode.classList.contains('pcpr-hl')
                && no.parentNode.dataset.hlId === id) continue;
            const m = doc.createElement('mark');
            m.className = 'pcpr-hl';
            m.dataset.hlId = id;
            m.dataset.cor = cor;
            m.style.backgroundColor = CORES[cor] || CORES.amarelo;
            no.parentNode.insertBefore(m, no);
            m.appendChild(no);
        }
        return alvo.length > 0;
    }

    function aplicarSalvas(doc) {
        injetarEstilo(doc);
        const marcas = marcasDoCapitulo();
        for (const m of marcas) {
            try {
                const mapa = construirMapa(doc); // rebuild: nós mudam a cada grifo aplicado
                const pos = localizar(mapa, m);
                if (pos < 0) continue;
                const ini = posParaNo(mapa, pos, false);
                const fim = posParaNo(mapa, pos + m.exact.length, true);
                if (!ini || !fim) continue;
                const range = doc.createRange();
                range.setStart(ini.node, ini.offset);
                range.setEnd(fim.node, fim.offset);
                envolverRange(doc, range, m.id, m.cor);
            } catch (e) { /* marca órfã: material mudou */ }
        }
    }

    function recolorir(doc, id, cor) {
        doc.querySelectorAll(`mark.pcpr-hl[data-hl-id="${id}"]`).forEach(m => {
            m.dataset.cor = cor;
            m.style.backgroundColor = CORES[cor] || CORES.amarelo;
        });
        gravarMarcas(marcasDoCapitulo().map(m => m.id === id ? { ...m, cor } : m));
    }

    function removerMarca(doc, id) {
        doc.querySelectorAll(`mark.pcpr-hl[data-hl-id="${id}"]`).forEach(m => {
            const pai = m.parentNode;
            while (m.firstChild) pai.insertBefore(m.firstChild, m);
            pai.removeChild(m);
            pai.normalize();
        });
        gravarMarcas(marcasDoCapitulo().filter(m => m.id !== id));
    }

    // ---------------- Criação a partir da seleção ----------------
    function criarDaSelecao(cor) {
        const doc = getDoc();
        if (!doc) return;
        const sel = doc.getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        const mapa = construirMapa(doc);
        const gi = indiceGlobal(mapa, range.startContainer, range.startOffset);
        const gf = indiceGlobal(mapa, range.endContainer, range.endOffset);
        if (gi < 0 || gf < 0 || gf <= gi) return;
        const marca = {
            id: 'hl_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            cor: cor,
            exact: mapa.full.slice(gi, gf),
            prefix: mapa.full.slice(Math.max(0, gi - 40), gi),
            suffix: mapa.full.slice(gf, gf + 40),
            criadoEm: Date.now()
        };
        injetarEstilo(doc);
        if (!envolverRange(doc, range, marca.id, cor)) return;
        gravarMarcas([...marcasDoCapitulo(), marca]);
        sel.removeAllRanges();
    }

    // ---------------- Popup (no documento pai) ----------------
    function criarPopup() {
        if (popup) return;
        popup = document.createElement('div');
        popup.id = 'hl-popup';
        popup.style.display = 'none';
        const dots = Object.keys(CORES).map(c =>
            `<button class="hl-dot" data-cor="${c}" title="${c[0].toUpperCase() + c.slice(1)}" style="background:${CORES[c]}"></button>`
        ).join('');
        popup.innerHTML = `${dots}<button id="hl-remover" title="Remover marcação"><i class="ph ph-trash"></i></button>`;
        document.body.appendChild(popup);

        popup.addEventListener('mousedown', e => e.preventDefault()); // não rouba a seleção
        popup.querySelectorAll('.hl-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const cor = dot.dataset.cor;
                corAtual = cor;
                localStorage.setItem(LS_COR, cor);
                const doc = getDoc();
                if (marcaEditando && doc) recolorir(doc, marcaEditando, cor);
                else criarDaSelecao(cor);
                esconderPopup();
            });
        });
        popup.querySelector('#hl-remover').addEventListener('click', () => {
            const doc = getDoc();
            if (marcaEditando && doc) removerMarca(doc, marcaEditando);
            esconderPopup();
        });
        document.addEventListener('mousedown', (e) => {
            if (!popup.contains(e.target)) esconderPopup();
        });
    }

    function mostrarPopup(rectIframe, modoEdicao) {
        criarPopup();
        const f = getIframe();
        if (!f) return;
        const fr = f.getBoundingClientRect();
        const top = fr.top + window.pageYOffset + rectIframe.top - 52;
        let left = fr.left + window.pageXOffset + rectIframe.left + (rectIframe.width / 2) - (popup.offsetWidth / 2 || 110);
        left = Math.max(8, left);
        popup.style.top = `${Math.max(8, top)}px`;
        popup.style.left = `${left}px`;
        popup.style.display = 'flex';
        popup.querySelector('#hl-remover').style.display = modoEdicao ? 'inline-flex' : 'none';
        popup.querySelectorAll('.hl-dot').forEach(d =>
            d.classList.toggle('hl-dot-atual', d.dataset.cor === corAtual));
    }

    function esconderPopup() {
        if (popup) popup.style.display = 'none';
        marcaEditando = null;
    }

    // ---------------- Eventos no iframe ----------------
    function prepararDocumento() {
        const doc = getDoc();
        if (!doc || !doc.body) return;
        if (doc.__hlPronto) return;
        doc.__hlPronto = true;
        injetarEstilo(doc);
        aplicarSalvas(doc);

        doc.addEventListener('mouseup', (e) => {
            setTimeout(() => {
                const sel = doc.getSelection();
                if (sel && !sel.isCollapsed && sel.toString().trim().length >= 2) {
                    marcaEditando = null;
                    mostrarPopup(sel.getRangeAt(0).getBoundingClientRect(), false);
                    return;
                }
                const alvo = e.target && e.target.closest && e.target.closest('mark.pcpr-hl');
                if (alvo) {
                    marcaEditando = alvo.dataset.hlId;
                    mostrarPopup(alvo.getBoundingClientRect(), true);
                    return;
                }
                esconderPopup();
            }, 10);
        });
    }

    function init() {
        criarPopup();
        const f = getIframe();
        if (f) {
            f.addEventListener('load', () => {
                esconderPopup();
                setTimeout(prepararDocumento, 500); // após injeções do app (estudado/questões)
            });
            if (f.src) setTimeout(prepararDocumento, 700); // capítulo já aberto
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    // Exposição para diagnóstico/testes (console: __pcprHl)
    window.__pcprHl = { construirMapa, indiceGlobal, posParaNo, localizar, envolverRange, aplicarSalvas, lerTudo };
})();
