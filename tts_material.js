// =====================================================================
// LEITOR EM VOZ ALTA (TTS) — aba Materiais
// Web Speech API: lê o capítulo aberto no iframe, parágrafo a parágrafo,
// com destaque visual, auto-scroll, controle de velocidade e voz.
// =====================================================================
(function () {
    'use strict';

    const synth = window.speechSynthesis;
    if (!synth) return; // navegador sem suporte

    // ---------------- Estado ----------------
    let blocos = [];          // [{ el, text }]
    let idx = 0;              // bloco atual
    let chunks = [];          // pedaços do bloco atual (frases)
    let chunkIdx = 0;
    let tocando = false;
    let retomarAposLoad = false; // continua no próximo capítulo se estava tocando
    let vozes = [];
    let utterAtual = null;       // referência viva: evita GC da fala no Chrome
    let tentouFallbackVoz = false;

    const LS_RATE = 'pcpr_tts_rate';
    const LS_VOICE = 'pcpr_tts_voice';
    const LS_POS = 'pcpr_tts_pos';

    // ---------------- Helpers de contexto ----------------
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
        return (d && c && d.value && c.value) ? `${d.value}::${c.value}` : (getIframe() ? getIframe().src : '');
    }

    // ---------------- Extração e limpeza do texto ----------------
    function limparTexto(raw) {
        if (!raw) return '';
        let t = raw;
        t = t.replace(/\((?:pp?\.|páginas?)\s*[\d\s,eaà–\-]+\)/gi, ' ');   // refs de página residuais
        t = t.replace(/[•▪◦·]/g, ', ');
        t = t.replace(/(?:->|→|⇒)/g, ' para ');
        t = t.replace(/©.*$/g, ' ');
        t = t.replace(/\bArts?\.\s*/g, m => m.startsWith('Arts') ? 'Artigos ' : 'Artigo ');
        t = t.replace(/§\s*/g, 'parágrafo ');
        t = t.replace(/\bnº\s*/gi, 'número ');
        t = t.replace(/\bex\.\s*:/gi, 'exemplo:');
        t = t.replace(/\s+/g, ' ').trim();
        return t;
    }

    function textoProprio(el) {
        const c = el.cloneNode(true);
        c.querySelectorAll('ul,ol,table,figure,img,script,style,.ref-pagina').forEach(n => n.remove());
        return limparTexto(c.textContent);
    }

    function ehItemDeIndice(el) {
        // <li> do índice: contém apenas um link para âncora interna
        if (el.tagName !== 'LI') return false;
        const a = el.querySelector('a[href^="#"]');
        if (!a) return false;
        const soLink = limparTexto(el.textContent) === limparTexto(a.textContent);
        return soLink;
    }

    function montarBlocos() {
        blocos = [];
        const doc = getDoc();
        if (!doc || !doc.body) return;
        const root = doc.querySelector('.container') || doc.body;
        const SEL = 'h1,h2,h3,h4,h5,p,li,figcaption,tr';
        const els = Array.from(root.querySelectorAll(SEL));
        for (const el of els) {
            if (ehItemDeIndice(el)) continue;
            let texto = '';
            if (el.tagName === 'TR') {
                if (el.querySelector('p,li,h1,h2,h3,h4,h5')) continue; // células complexas: filhos entram sozinhos
                const cels = Array.from(el.querySelectorAll('td,th')).map(td => textoProprio(td)).filter(Boolean);
                texto = cels.join(' — ');
            } else {
                texto = textoProprio(el);
            }
            if (texto.length < 2) continue;
            blocos.push({ el, text: texto });
        }
        injetarEstiloDestaque(doc);
    }

    function quebrarEmFrases(texto) {
        const partes = texto.match(/[^.!?;]+[.!?;]+\s*|[^.!?;]+$/g) || [texto];
        // agrega frases curtas em pedaços de até ~200 caracteres (evita corte do Chrome)
        const out = [];
        let atual = '';
        for (const p of partes) {
            if ((atual + p).length > 200 && atual) { out.push(atual.trim()); atual = p; }
            else atual += p;
        }
        if (atual.trim()) out.push(atual.trim());
        return out;
    }

    // ---------------- Destaque visual ----------------
    function injetarEstiloDestaque(doc) {
        if (!doc || doc.getElementById('__tts_style')) return;
        const st = doc.createElement('style');
        st.id = '__tts_style';
        st.textContent =
            '.tts-reading{background:rgba(59,130,246,0.16) !important;outline:2px solid rgba(59,130,246,0.5);' +
            'outline-offset:2px;border-radius:6px;transition:background .25s;}';
        doc.head.appendChild(st);
    }

    function destacar(i) {
        const doc = getDoc();
        if (!doc) return;
        doc.querySelectorAll('.tts-reading').forEach(n => n.classList.remove('tts-reading'));
        const b = blocos[i];
        if (!b || !b.el || !b.el.isConnected) return;
        b.el.classList.add('tts-reading');
        // O iframe tem a altura do conteúdo (a página rola no pai): rolar a janela principal
        try {
            const f = getIframe();
            const topo = f.getBoundingClientRect().top + window.pageYOffset + b.el.getBoundingClientRect().top;
            window.scrollTo({ top: Math.max(0, topo - 180), behavior: 'smooth' });
        } catch (e) { /* silencioso */ }
    }

    function limparDestaque() {
        const doc = getDoc();
        if (doc) doc.querySelectorAll('.tts-reading').forEach(n => n.classList.remove('tts-reading'));
    }

    // ---------------- Vozes ----------------
    function carregarVozes() {
        vozes = synth.getVoices() || [];
        const sel = document.getElementById('tts-voice');
        if (!sel) return;
        const salva = localStorage.getItem(LS_VOICE) || '';
        const pt = vozes.filter(v => /^pt/i.test(v.lang));
        const outras = vozes.filter(v => !/^pt/i.test(v.lang));
        sel.innerHTML = '';
        const addOpt = (v) => {
            const o = document.createElement('option');
            o.value = v.voiceURI;
            o.textContent = `${v.name} (${v.lang})`;
            sel.appendChild(o);
        };
        pt.forEach(addOpt);
        if (pt.length && outras.length) {
            const sep = document.createElement('option');
            sep.disabled = true; sep.textContent = '──────────';
            sel.appendChild(sep);
        }
        outras.forEach(addOpt);
        // preferência: salva → Google pt-BR → qualquer pt-BR → qualquer pt
        let escolhida = vozes.find(v => v.voiceURI === salva)
            || pt.find(v => /google/i.test(v.name) && /BR/i.test(v.lang))
            || pt.find(v => /BR/i.test(v.lang))
            || pt[0];
        if (escolhida) sel.value = escolhida.voiceURI;
    }

    function vozAtual() {
        const sel = document.getElementById('tts-voice');
        if (sel && sel.value) {
            const v = vozes.find(x => x.voiceURI === sel.value);
            if (v) return v;
        }
        return null;
    }

    function rateAtual() {
        const sel = document.getElementById('tts-rate');
        return sel ? parseFloat(sel.value) : 1;
    }

    // ---------------- Persistência de posição ----------------
    function salvarPosicao() {
        try {
            const pos = JSON.parse(localStorage.getItem(LS_POS) || '{}');
            pos[chaveCapitulo()] = idx;
            localStorage.setItem(LS_POS, JSON.stringify(pos));
        } catch (e) { }
    }

    function posicaoSalva() {
        try {
            const pos = JSON.parse(localStorage.getItem(LS_POS) || '{}');
            const i = pos[chaveCapitulo()];
            return (typeof i === 'number' && i > 0 && i < blocos.length - 1) ? i : 0;
        } catch (e) { return 0; }
    }

    // ---------------- Motor de fala ----------------
    function falarChunk() {
        if (!tocando) return;
        if (chunkIdx >= chunks.length) { avancarBloco(); return; }
        const u = new SpeechSynthesisUtterance(chunks[chunkIdx]);
        const v = (!tentouFallbackVoz && vozAtual()) || null;
        if (v) u.voice = v;
        u.lang = (v && v.lang) || 'pt-BR';
        u.rate = rateAtual();
        u.volume = 1;
        let comecou = false;
        u.onstart = () => { comecou = true; atualizarProgresso(); };
        u.onend = () => { chunkIdx++; falarChunk(); };
        u.onerror = (e) => {
            // 'interrupted'/'canceled' são esperados ao navegar; outros erros: tenta seguir
            if (tocando && e.error !== 'interrupted' && e.error !== 'canceled') { chunkIdx++; falarChunk(); }
        };
        utterAtual = u; // mantém referência (bug de GC do Chrome)
        try { synth.resume(); } catch (e) { }
        synth.speak(u);
        try { synth.resume(); } catch (e) { } // Chrome pode iniciar "pausado"
        // Vigia: se em 2.5s nada começou a tocar, tenta uma vez com a voz padrão do sistema
        setTimeout(() => {
            if (!tocando || comecou || synth.speaking || synth.pending) return;
            if (!tentouFallbackVoz) {
                tentouFallbackVoz = true;
                setStatus('Tentando voz padrão…');
                synth.cancel();
                setTimeout(falarChunk, 120);
            } else {
                setStatus('Sem áudio — teste outra voz na lista');
            }
        }, 2500);
    }

    function tocarBloco(i) {
        if (i < 0 || i >= blocos.length) { finalizarCapitulo(); return; }
        idx = i;
        chunks = quebrarEmFrases(blocos[i].text);
        chunkIdx = 0;
        destacar(i);
        atualizarProgresso();
        salvarPosicao();
        falarChunk();
    }

    function avancarBloco() { if (tocando) tocarBloco(idx + 1); }

    function play(deIndice) {
        if (!blocos.length) montarBlocos();
        mostrarPlayer(true);
        if (!blocos.length) { setStatus('Abra um capítulo primeiro'); return; }
        const ocupado = synth.speaking || synth.pending;
        synth.cancel();
        tocando = true;
        atualizarBotoes();
        const inicio = (typeof deIndice === 'number') ? deIndice : idx;
        // cancel() + speak() imediato falha em alguns Chromes; sem fala ativa, dispara direto
        const delay = ocupado ? 80 : 0;
        setTimeout(() => { if (tocando) tocarBloco(Math.min(inicio, blocos.length - 1)); }, delay);
    }

    function pausar() {
        tocando = false;
        synth.cancel(); // cancel (e não pause): retomamos pelo bloco atual — pause() é bugado no Chrome
        atualizarBotoes();
        setStatus('Pausado');
    }

    function parar(ocultar) {
        tocando = false;
        retomarAposLoad = false;
        synth.cancel();
        limparDestaque();
        atualizarBotoes();
        if (ocultar) mostrarPlayer(false);
    }

    function finalizarCapitulo() {
        tocando = false;
        atualizarBotoes();
        limparDestaque();
        setStatus('Fim do capítulo ✓');
        // limpa posição salva (capítulo concluído)
        try {
            const pos = JSON.parse(localStorage.getItem(LS_POS) || '{}');
            delete pos[chaveCapitulo()];
            localStorage.setItem(LS_POS, JSON.stringify(pos));
        } catch (e) { }
        const u = new SpeechSynthesisUtterance('Fim do capítulo.');
        const v = vozAtual(); if (v) u.voice = v;
        u.lang = 'pt-BR'; u.rate = rateAtual();
        synth.speak(u);
    }

    // ---------------- UI ----------------
    function criarPlayer() {
        if (document.getElementById('tts-player')) return;
        const bar = document.createElement('div');
        bar.id = 'tts-player';
        bar.style.display = 'none';
        bar.innerHTML = `
            <button id="tts-restart" class="tts-btn" title="Recomeçar do início"><i class="ph ph-skip-back"></i></button>
            <button id="tts-prev" class="tts-btn" title="Parágrafo anterior"><i class="ph ph-caret-left"></i></button>
            <button id="tts-toggle" class="tts-btn tts-btn-main" title="Tocar/Pausar"><i class="ph ph-play"></i></button>
            <button id="tts-next" class="tts-btn" title="Próximo parágrafo"><i class="ph ph-caret-right"></i></button>
            <span id="tts-status" class="tts-status">—</span>
            <select id="tts-rate" class="tts-select" title="Velocidade">
                <option value="0.75">0.75×</option>
                <option value="1" selected>1×</option>
                <option value="1.15">1.15×</option>
                <option value="1.3">1.3×</option>
                <option value="1.5">1.5×</option>
                <option value="1.75">1.75×</option>
                <option value="2">2×</option>
            </select>
            <select id="tts-voice" class="tts-select tts-select-voice" title="Voz"></select>
            <button id="tts-close" class="tts-btn" title="Fechar leitor"><i class="ph ph-x"></i></button>`;
        document.body.appendChild(bar);

        // preferências salvas
        const r = localStorage.getItem(LS_RATE);
        if (r) bar.querySelector('#tts-rate').value = r;

        bar.querySelector('#tts-toggle').addEventListener('click', () => { tocando ? pausar() : play(); });
        bar.querySelector('#tts-prev').addEventListener('click', () => { if (idx > 0) { synth.cancel(); idx--; if (tocando) tocarBloco(idx); else { destacar(idx); atualizarProgresso(); } } });
        bar.querySelector('#tts-next').addEventListener('click', () => { if (idx < blocos.length - 1) { synth.cancel(); idx++; if (tocando) tocarBloco(idx); else { destacar(idx); atualizarProgresso(); } } });
        bar.querySelector('#tts-restart').addEventListener('click', () => { idx = 0; if (tocando) { synth.cancel(); tocarBloco(0); } else { destacar(0); atualizarProgresso(); } });
        bar.querySelector('#tts-close').addEventListener('click', () => parar(true));
        bar.querySelector('#tts-rate').addEventListener('change', (e) => {
            localStorage.setItem(LS_RATE, e.target.value);
            if (tocando) { synth.cancel(); tocarBloco(idx); } // aplica já no bloco atual
        });
        bar.querySelector('#tts-voice').addEventListener('change', (e) => {
            localStorage.setItem(LS_VOICE, e.target.value);
            tentouFallbackVoz = false; // usuário escolheu outra voz: volta a respeitá-la
            if (tocando) { synth.cancel(); setTimeout(() => { if (tocando) tocarBloco(idx); }, 80); }
        });
    }

    function mostrarPlayer(exibir) {
        const bar = document.getElementById('tts-player');
        if (bar) bar.style.display = exibir ? 'flex' : 'none';
    }

    function atualizarBotoes() {
        const t = document.querySelector('#tts-toggle i');
        if (t) t.className = tocando ? 'ph ph-pause' : 'ph ph-play';
        const btnTop = document.querySelector('#btn-ouvir-material i');
        if (btnTop) btnTop.className = tocando ? 'ph ph-speaker-high' : 'ph ph-headphones';
    }

    function atualizarProgresso() {
        setStatus(`${idx + 1} / ${blocos.length}`);
    }

    function setStatus(msg) {
        const s = document.getElementById('tts-status');
        if (s) s.textContent = msg;
    }

    // ---------------- Integração com a tela de materiais ----------------
    function aoCarregarCapitulo() {
        const continuar = retomarAposLoad && tocando;
        tocando = false;
        synth.cancel();
        blocos = [];
        idx = 0;
        // o iframe demora um tique para o postMessage de altura; extrai já
        setTimeout(() => {
            montarBlocos();
            if (!blocos.length) { atualizarBotoes(); return; }
            idx = posicaoSalva();
            if (continuar) { play(0); }
            else { atualizarProgresso(); atualizarBotoes(); }
        }, 350);
    }

    function init() {
        criarPlayer();
        carregarVozes();
        if (typeof synth.onvoiceschanged !== 'undefined') synth.onvoiceschanged = carregarVozes;

        // destrava estado "pausado" herdado de sessão anterior (bug do Chrome)
        try { synth.cancel(); synth.resume(); } catch (e) { }

        const btn = document.getElementById('btn-ouvir-material');
        if (btn) {
            btn.addEventListener('click', () => {
                try {
                    if (tocando) { pausar(); return; }
                    if (vozes.length === 0) carregarVozes(); // Chrome só entrega vozes após interação, às vezes
                    if (!blocos.length) { montarBlocos(); idx = posicaoSalva(); }
                    play();
                } catch (err) {
                    mostrarPlayer(true);
                    setStatus('Erro: ' + (err && err.message ? err.message : err));
                }
            });
        }

        const f = getIframe();
        if (f) f.addEventListener('load', () => {
            retomarAposLoad = tocando; // se estava ouvindo e trocou de capítulo, segue no novo
            aoCarregarCapitulo();
        });

        // parar fala ao fechar/recerregar a página
        window.addEventListener('beforeunload', () => synth.cancel());
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
