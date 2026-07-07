// =====================================================================
// LEITOR EM VOZ ALTA — aba Materiais
// Modo 1 (preferido): áudio neural pré-gerado (MP3 em materiais/<DISC>/AUDIO/)
//   com destaque de parágrafo sincronizado por marcações de tempo (.json).
// Modo 2 (fallback): Web Speech API (voz do navegador).
// =====================================================================
(function () {
    'use strict';

    const synth = window.speechSynthesis || null;

    // ---------------- Estado ----------------
    let blocos = [];             // [{ el, text }]
    let idx = 0;                 // bloco atual (nos dois modos)
    let chunks = [];             // (speech) pedaços do bloco atual
    let chunkIdx = 0;
    let tocando = false;
    let retomarAposLoad = false; // continua ao trocar de capítulo
    let vozes = [];
    let utterAtual = null;       // referência viva: evita GC da fala no Chrome
    let tentouFallbackVoz = false;

    let modo = 'speech';         // 'audio' | 'speech'
    let audioEl = null;          // <audio> para o modo MP3
    let marks = [];              // [{t, s, bi}] tempos por bloco (bi = índice em blocos)
    let audioBase = '';          // materiais/<DISC>/AUDIO/<Capitulo_XX>
    let ultimoSalvamento = 0;

    const LS_RATE = 'pcpr_tts_rate';
    const LS_VOICE = 'pcpr_tts_voice';
    const LS_POS = 'pcpr_tts_pos';        // speech: índice de bloco por capítulo
    const LS_APOS = 'pcpr_tts_apos';      // audio: segundos por capítulo

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

    function baseAudioDoCapitulo() {
        const f = getIframe();
        if (!f || !f.src) return '';
        const m = f.src.match(/materiais\/([^/]+)\/HTML\/([^/?#]+)\.html/i);
        return m ? `materiais/${m[1]}/AUDIO/${m[2]}` : '';
    }

    // ---------------- Extração e limpeza do texto ----------------
    function limparTexto(raw) {
        if (!raw) return '';
        let t = raw;
        t = t.replace(/\((?:pp?\.|páginas?)\s*[\d\s,eaà–\-]+\)/gi, ' ');
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
        if (el.tagName !== 'LI') return false;
        const a = el.querySelector('a[href^="#"]');
        if (!a) return false;
        return limparTexto(el.textContent) === limparTexto(a.textContent);
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
                if (el.querySelector('p,li,h1,h2,h3,h4,h5')) continue;
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
        try {
            const f = getIframe();
            const topo = f.getBoundingClientRect().top + window.pageYOffset + b.el.getBoundingClientRect().top;
            window.scrollTo({ top: Math.max(0, topo - 180), behavior: 'smooth' });
        } catch (e) { }
    }

    function limparDestaque() {
        const doc = getDoc();
        if (doc) doc.querySelectorAll('.tts-reading').forEach(n => n.classList.remove('tts-reading'));
    }

    // ---------------- Vozes (modo speech) ----------------
    function carregarVozes() {
        if (!synth) return;
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
            if (modo === 'audio' && audioEl) {
                const pos = JSON.parse(localStorage.getItem(LS_APOS) || '{}');
                pos[chaveCapitulo()] = Math.floor(audioEl.currentTime);
                localStorage.setItem(LS_APOS, JSON.stringify(pos));
            } else {
                const pos = JSON.parse(localStorage.getItem(LS_POS) || '{}');
                pos[chaveCapitulo()] = idx;
                localStorage.setItem(LS_POS, JSON.stringify(pos));
            }
        } catch (e) { }
    }

    function posicaoSalvaSpeech() {
        try {
            const pos = JSON.parse(localStorage.getItem(LS_POS) || '{}');
            const i = pos[chaveCapitulo()];
            return (typeof i === 'number' && i > 0 && i < blocos.length - 1) ? i : 0;
        } catch (e) { return 0; }
    }

    function posicaoSalvaAudio() {
        try {
            const pos = JSON.parse(localStorage.getItem(LS_APOS) || '{}');
            const t = pos[chaveCapitulo()];
            return (typeof t === 'number' && t > 2) ? t : 0;
        } catch (e) { return 0; }
    }

    function limparPosicaoSalva() {
        try {
            const p1 = JSON.parse(localStorage.getItem(LS_POS) || '{}');
            delete p1[chaveCapitulo()];
            localStorage.setItem(LS_POS, JSON.stringify(p1));
            const p2 = JSON.parse(localStorage.getItem(LS_APOS) || '{}');
            delete p2[chaveCapitulo()];
            localStorage.setItem(LS_APOS, JSON.stringify(p2));
        } catch (e) { }
    }

    // ---------------- MODO ÁUDIO (MP3 neural) ----------------
    function normalizarPrefixo(s) {
        return (s || '').toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 36);
    }

    function mapearMarks(rawMarks) {
        // alinha marks (gerados no build) aos blocos extraídos agora
        marks = [];
        if (!rawMarks || !rawMarks.length) return;
        if (rawMarks.length === blocos.length) {
            marks = rawMarks.map((m, i) => ({ t: m.t, bi: i }));
            return;
        }
        // contagens diferentes: casamento sequencial por prefixo (janela de 4)
        let j = 0;
        for (const m of rawMarks) {
            const alvo = normalizarPrefixo(m.s);
            let achou = -1;
            for (let k = j; k < Math.min(j + 4, blocos.length); k++) {
                if (normalizarPrefixo(blocos[k].text).startsWith(alvo.slice(0, 20))) { achou = k; break; }
            }
            if (achou >= 0) { marks.push({ t: m.t, bi: achou }); j = achou + 1; }
        }
    }

    function blocoDoTempo(t) {
        let lo = 0, hi = marks.length - 1, ans = 0;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            if (marks[mid].t <= t + 0.05) { ans = mid; lo = mid + 1; }
            else hi = mid - 1;
        }
        return ans;
    }

    function criarAudioEl() {
        if (audioEl) return audioEl;
        audioEl = new Audio();
        audioEl.preload = 'metadata';
        audioEl.addEventListener('timeupdate', () => {
            if (modo !== 'audio') return;
            if (marks.length) {
                const mi = blocoDoTempo(audioEl.currentTime);
                const bi = marks[mi].bi;
                if (bi !== idx) { idx = bi; destacar(idx); atualizarProgresso(); }
            } else {
                setStatus(fmtTempo(audioEl.currentTime) + ' / ' + fmtTempo(audioEl.duration));
            }
            const agora = Date.now();
            if (agora - ultimoSalvamento > 4000) { ultimoSalvamento = agora; salvarPosicao(); }
        });
        audioEl.addEventListener('play', () => { tocando = true; atualizarBotoes(); });
        audioEl.addEventListener('pause', () => {
            if (!audioEl.ended) { tocando = false; atualizarBotoes(); setStatus('Pausado'); salvarPosicao(); }
        });
        audioEl.addEventListener('ended', () => {
            limparPosicaoSalva();
            limparDestaque();
            setStatus('Fim do capítulo ✓');
            // segue para o próximo capítulo automaticamente
            const btnProx = document.getElementById('btn-cap-proximo');
            if (btnProx && !btnProx.disabled) {
                retomarAposLoad = true;
                setStatus('Próximo capítulo…');
                btnProx.click();
            } else {
                tocando = false;
                atualizarBotoes();
            }
        });
        audioEl.addEventListener('error', () => {
            // arquivo falhou no meio: cai para a voz do navegador
            if (modo === 'audio') {
                modo = 'speech';
                atualizarModoUI();
                setStatus('Áudio indisponível — usando voz do navegador');
            }
        });
        return audioEl;
    }

    async function detectarAudio() {
        audioBase = baseAudioDoCapitulo();
        if (!audioBase) { modo = 'speech'; atualizarModoUI(); return; }
        try {
            const r = await fetch(audioBase + '.mp3', { method: 'HEAD' });
            if (!r.ok) { modo = 'speech'; atualizarModoUI(); return; }
            modo = 'audio';
            criarAudioEl();
            const alvoSrc = new URL(audioBase + '.mp3', location.href).href;
            if (audioEl.src !== alvoSrc) audioEl.src = alvoSrc;
            audioEl.playbackRate = rateAtual();
            // marcações de tempo (opcionais)
            let raw = [];
            try {
                const rm = await fetch(audioBase + '.json');
                if (rm.ok) { const j = await rm.json(); raw = j.blocks || []; }
            } catch (e) { }
            mapearMarks(raw);
            atualizarModoUI();
        } catch (e) {
            modo = 'speech';
            atualizarModoUI();
        }
    }

    function playAudio(doInicio) {
        criarAudioEl();
        mostrarPlayer(true);
        if (typeof doInicio === 'number') audioEl.currentTime = doInicio;
        else if (audioEl.currentTime < 1) {
            const t = posicaoSalvaAudio();
            if (t > 0) audioEl.currentTime = t;
        }
        audioEl.playbackRate = rateAtual();
        const p = audioEl.play();
        if (p && p.catch) p.catch(err => setStatus('Erro no áudio: ' + err.message));
        configurarMediaSession();
    }

    function seekBloco(delta) {
        if (!marks.length) {
            audioEl.currentTime = Math.max(0, audioEl.currentTime + delta * 15); // sem marks: pula 15s
            return;
        }
        const mi = blocoDoTempo(audioEl.currentTime);
        const alvo = Math.min(Math.max(mi + delta, 0), marks.length - 1);
        audioEl.currentTime = marks[alvo].t + 0.02;
        idx = marks[alvo].bi;
        destacar(idx);
        atualizarProgresso();
    }

    function fmtTempo(s) {
        if (!isFinite(s)) return '–:––';
        const m = Math.floor(s / 60), ss = Math.floor(s % 60);
        return m + ':' + String(ss).padStart(2, '0');
    }

    function configurarMediaSession() {
        if (!('mediaSession' in navigator)) return;
        const titulo = (document.getElementById('reader-cap-title') || {}).textContent || 'Material';
        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: titulo.trim(),
                artist: 'CFP 2026 — Simulador',
                album: 'Materiais'
            });
            navigator.mediaSession.setActionHandler('play', () => playAudio());
            navigator.mediaSession.setActionHandler('pause', () => audioEl && audioEl.pause());
            navigator.mediaSession.setActionHandler('previoustrack', () => seekBloco(-1));
            navigator.mediaSession.setActionHandler('nexttrack', () => seekBloco(1));
        } catch (e) { }
    }

    // ---------------- MODO SPEECH (voz do navegador) ----------------
    function falarChunk() {
        if (!tocando || modo !== 'speech') return;
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
            if (tocando && e.error !== 'interrupted' && e.error !== 'canceled') { chunkIdx++; falarChunk(); }
        };
        utterAtual = u;
        try { synth.resume(); } catch (e) { }
        synth.speak(u);
        try { synth.resume(); } catch (e) { }
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
        if (i < 0 || i >= blocos.length) { finalizarCapituloSpeech(); return; }
        idx = i;
        chunks = quebrarEmFrases(blocos[i].text);
        chunkIdx = 0;
        destacar(i);
        atualizarProgresso();
        salvarPosicao();
        falarChunk();
    }

    function avancarBloco() { if (tocando) tocarBloco(idx + 1); }

    function playSpeech(deIndice) {
        if (!synth) { setStatus('Navegador sem suporte a voz'); return; }
        const ocupado = synth.speaking || synth.pending;
        synth.cancel();
        tocando = true;
        atualizarBotoes();
        const inicio = (typeof deIndice === 'number') ? deIndice : idx;
        const delay = ocupado ? 80 : 0;
        setTimeout(() => { if (tocando) tocarBloco(Math.min(inicio, blocos.length - 1)); }, delay);
    }

    function finalizarCapituloSpeech() {
        limparPosicaoSalva();
        limparDestaque();
        setStatus('Fim do capítulo ✓');
        const btnProx = document.getElementById('btn-cap-proximo');
        if (btnProx && !btnProx.disabled) {
            retomarAposLoad = true;
            setStatus('Próximo capítulo…');
            btnProx.click();
        } else {
            tocando = false;
            atualizarBotoes();
        }
    }

    // ---------------- Controles unificados ----------------
    function play(deIndice) {
        if (!blocos.length) montarBlocos();
        mostrarPlayer(true);
        if (modo === 'audio') { tocando = true; atualizarBotoes(); playAudio(typeof deIndice === 'number' && marks[deIndice] ? marks[deIndice].t : undefined); return; }
        if (!blocos.length) { setStatus('Abra um capítulo primeiro'); return; }
        playSpeech(deIndice);
    }

    function pausar() {
        if (modo === 'audio' && audioEl) { audioEl.pause(); return; }
        tocando = false;
        if (synth) synth.cancel();
        atualizarBotoes();
        setStatus('Pausado');
    }

    function parar(ocultar) {
        tocando = false;
        retomarAposLoad = false;
        if (audioEl) audioEl.pause();
        if (synth) synth.cancel();
        limparDestaque();
        atualizarBotoes();
        if (ocultar) mostrarPlayer(false);
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
            <span id="tts-mode" class="tts-mode" title="Origem da voz"></span>
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

        const r = localStorage.getItem(LS_RATE);
        if (r) bar.querySelector('#tts-rate').value = r;

        bar.querySelector('#tts-toggle').addEventListener('click', () => { tocando ? pausar() : play(); });
        bar.querySelector('#tts-prev').addEventListener('click', () => {
            if (modo === 'audio' && audioEl) { seekBloco(-1); return; }
            if (idx > 0) { synth.cancel(); idx--; if (tocando) tocarBloco(idx); else { destacar(idx); atualizarProgresso(); } }
        });
        bar.querySelector('#tts-next').addEventListener('click', () => {
            if (modo === 'audio' && audioEl) { seekBloco(1); return; }
            if (idx < blocos.length - 1) { synth.cancel(); idx++; if (tocando) tocarBloco(idx); else { destacar(idx); atualizarProgresso(); } }
        });
        bar.querySelector('#tts-restart').addEventListener('click', () => {
            if (modo === 'audio' && audioEl) { audioEl.currentTime = 0; if (!tocando) { setStatus('Início'); } return; }
            idx = 0;
            if (tocando) { synth.cancel(); tocarBloco(0); } else { destacar(0); atualizarProgresso(); }
        });
        bar.querySelector('#tts-close').addEventListener('click', () => parar(true));
        bar.querySelector('#tts-rate').addEventListener('change', (e) => {
            localStorage.setItem(LS_RATE, e.target.value);
            if (modo === 'audio' && audioEl) { audioEl.playbackRate = parseFloat(e.target.value); return; }
            if (tocando) { synth.cancel(); setTimeout(() => { if (tocando) tocarBloco(idx); }, 80); }
        });
        bar.querySelector('#tts-voice').addEventListener('change', (e) => {
            localStorage.setItem(LS_VOICE, e.target.value);
            tentouFallbackVoz = false;
            if (modo === 'speech' && tocando) { synth.cancel(); setTimeout(() => { if (tocando) tocarBloco(idx); }, 80); }
        });
    }

    function atualizarModoUI() {
        const selVoz = document.getElementById('tts-voice');
        const badge = document.getElementById('tts-mode');
        if (selVoz) selVoz.style.display = (modo === 'audio') ? 'none' : '';
        if (badge) {
            badge.textContent = (modo === 'audio') ? '✨ Neural' : '';
            badge.style.display = (modo === 'audio') ? '' : 'none';
        }
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
        const total = (modo === 'audio' && marks.length) ? marks.length : blocos.length;
        const atual = (modo === 'audio' && marks.length) ? (blocoDoTempo(audioEl ? audioEl.currentTime : 0) + 1) : (idx + 1);
        setStatus(`${atual} / ${total}`);
    }

    function setStatus(msg) {
        const s = document.getElementById('tts-status');
        if (s) s.textContent = msg;
    }

    // ---------------- Integração com a tela de materiais ----------------
    function aoCarregarCapitulo() {
        const continuar = retomarAposLoad;
        retomarAposLoad = false;
        tocando = false;
        if (synth) synth.cancel();
        if (audioEl) { audioEl.pause(); audioEl.removeAttribute('src'); audioEl.load(); }
        blocos = [];
        idx = 0;
        marks = [];
        setTimeout(async () => {
            montarBlocos();
            await detectarAudio();
            if (continuar) { play(modo === 'audio' ? undefined : 0); if (modo === 'audio' && audioEl) audioEl.currentTime = 0; return; }
            if (blocos.length) { idx = posicaoSalvaSpeech(); atualizarProgresso(); }
            atualizarBotoes();
        }, 350);
    }

    function init() {
        criarPlayer();
        carregarVozes();
        if (synth && typeof synth.onvoiceschanged !== 'undefined') synth.onvoiceschanged = carregarVozes;
        try { if (synth) { synth.cancel(); synth.resume(); } } catch (e) { }

        const btn = document.getElementById('btn-ouvir-material');
        if (btn) {
            btn.addEventListener('click', () => {
                try {
                    if (tocando) { pausar(); return; }
                    if (vozes.length === 0) carregarVozes();
                    if (!blocos.length) { montarBlocos(); idx = posicaoSalvaSpeech(); }
                    if (!audioBase) { detectarAudio().then(() => play()); return; }
                    play();
                } catch (err) {
                    mostrarPlayer(true);
                    setStatus('Erro: ' + (err && err.message ? err.message : err));
                }
            });
        }

        const f = getIframe();
        if (f) f.addEventListener('load', () => {
            retomarAposLoad = retomarAposLoad || tocando;
            aoCarregarCapitulo();
        });

        window.addEventListener('beforeunload', () => { if (synth) synth.cancel(); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
