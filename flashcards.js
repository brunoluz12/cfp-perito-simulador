// flashcards.js - Lógica de Flash Cards (Sistema de Repetição Espaçada)

let flashcards = [];
// Formato do card:
// { id: string, deck: string, front: string, back: string, created: timestamp, interval: number, ease: number, due: timestamp, reviews: number, lapses: number }

let currentReviewSession = [];
let currentCardIndex = 0;
let isCardFlipped = false;
let currentDeckFilter = null;
let isFreeReview = false;

// Carregar flashcards
function loadFlashcards() {
    const saved = localStorage.getItem('pcpr_flashcards');
    if (saved) {
        try {
            flashcards = JSON.parse(saved);
        } catch (e) {
            console.error("Erro ao carregar flashcards:", e);
            flashcards = [];
        }
    } else {
        flashcards = [];
    }
    if (typeof renderFlashcardDashboard === 'function') {
        renderFlashcardDashboard();
    }
}

// Salvar flashcards
function saveFlashcards() {
    localStorage.setItem('pcpr_flashcards', JSON.stringify(flashcards));
    if (typeof requestCloudSync === 'function') {
        requestCloudSync();
    }
}

// Criar um novo card
function criarCard(deck, front, back) {
    const newCard = {
        id: "fc_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        deck: deck.trim() || "Geral",
        front: front,
        back: back,
        created: Date.now(),
        interval: 0,
        ease: 2.5,
        due: Date.now(),
        reviews: 0,
        lapses: 0
    };
    flashcards.push(newCard);
    saveFlashcards();
    renderFlashcardDashboard();
}

// Editar card
function editarCard(id, deck, front, back) {
    const card = flashcards.find(c => c.id === id);
    if (card) {
        card.deck = deck.trim() || "Geral";
        card.front = front;
        card.back = back;
        saveFlashcards();
        renderFlashcardDashboard();
    }
}

// Excluir card
function excluirCard(id) {
    flashcards = flashcards.filter(c => c.id !== id);
    saveFlashcards();
    renderFlashcardDashboard();
}

// Obter cards pendentes
function getCardsPendentes(deckFilter = null) {
    const now = Date.now();
    return flashcards.filter(c => {
        if (deckFilter && c.deck !== deckFilter) return false;
        return c.due <= now;
    });
}

// Estatísticas por baralho
function getDeckStats() {
    const stats = {};
    const now = Date.now();

    flashcards.forEach(c => {
        if (!stats[c.deck]) {
            stats[c.deck] = { total: 0, new: 0, due: 0 };
        }
        stats[c.deck].total++;
        if (c.reviews === 0) stats[c.deck].new++;
        else if (c.due <= now) stats[c.deck].due++;
    });

    return Object.keys(stats).sort().map(deck => ({
        deck: deck,
        ...stats[deck]
    }));
}

// Iniciar Revisão
function iniciarRevisao(deckFilter = null) {
    currentDeckFilter = deckFilter;
    let pendentes = getCardsPendentes(deckFilter);
    
    if (pendentes.length === 0) {
        // Modo Prática (Revisão Livre)
        const allCards = deckFilter ? flashcards.filter(c => c.deck === deckFilter) : flashcards;
        if (allCards.length === 0) {
            alert("Não há cards neste baralho!");
            return;
        }
        if (confirm("Você não tem cards agendados para hoje neste baralho. Deseja iniciar uma sessão de PRÁTICA (Revisão Livre)?\n\nNeste modo as datas de revisão oficiais não serão alteradas.")) {
            currentReviewSession = [...allCards];
            isFreeReview = true;
        } else {
            return;
        }
    } else {
        currentReviewSession = [...pendentes];
        isFreeReview = false;
    }
    
    // Shuffle cards
    for (let i = currentReviewSession.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentReviewSession[i], currentReviewSession[j]] = [currentReviewSession[j], currentReviewSession[i]];
    }

    currentCardIndex = 0;
    
    document.getElementById('fc-dashboard-area').style.display = 'none';
    document.getElementById('fc-review-area').style.display = 'block';
    
    mostrarCardAtual();
}

function mostrarCardAtual() {
    if (currentCardIndex >= currentReviewSession.length) {
        encerrarRevisao();
        return;
    }

    const card = currentReviewSession[currentCardIndex];
    const modeBadge = isFreeReview ? ' <span class="fc-badge new" style="margin-left: 8px;">Modo Prática</span>' : '';
    document.getElementById('fc-review-deck-name').innerHTML = card.deck + modeBadge;
    document.getElementById('fc-review-progress').textContent = `${currentCardIndex + 1} / ${currentReviewSession.length}`;
    
    document.getElementById('fc-card-front-content').innerHTML = formatText(card.front);
    document.getElementById('fc-card-back-content').innerHTML = formatText(card.back);
    
    const cardElement = document.getElementById('fc-active-card');
    cardElement.classList.remove('flipped');
    isCardFlipped = false;
    
    document.getElementById('fc-review-actions').style.display = 'none';
    document.getElementById('fc-show-answer-btn').style.display = 'block';
}

function virarCard() {
    if (isCardFlipped) return;
    document.getElementById('fc-active-card').classList.add('flipped');
    isCardFlipped = true;
    document.getElementById('fc-show-answer-btn').style.display = 'none';
    document.getElementById('fc-review-actions').style.display = 'flex';
}

function responderCard(quality) {
    const card = currentReviewSession[currentCardIndex];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    // Algoritmo SRS simplificado
    // qualities: 1=Errei, 2=Difícil, 3=Bom, 4=Fácil
    
    if (isFreeReview) {
        // Se for prática, não altera o SRS e não salva.
        // Apenas avança. Se errar, volta pro final do baralho de prática.
        if (quality === 1) {
            currentReviewSession.push(card);
        }
    } else {
        if (quality === 1) { // Errei
            card.lapses++;
            card.interval = 0; // Volta para 0 dias
            card.ease = Math.max(1.3, card.ease - 0.2);
            card.due = now + (1 * 60 * 1000); // Revisa em 1 minuto (final da sessão)
            // Adiciona ao final da sessão para revisar de novo
            currentReviewSession.push(card);
        } else {
            if (card.reviews === 0 || card.interval === 0) {
                // Primeiro acerto ou recuperação
                if (quality === 2) card.interval = 1;
                else if (quality === 3) card.interval = 3;
                else if (quality === 4) card.interval = 5;
            } else {
                if (quality === 2) {
                    card.interval = card.interval * 1.2;
                    card.ease = Math.max(1.3, card.ease - 0.15);
                } else if (quality === 3) {
                    card.interval = (card.interval * card.ease);
                } else if (quality === 4) {
                    card.interval = (card.interval * card.ease * 1.3);
                    card.ease += 0.15;
                }
            }
            card.due = now + (card.interval * dayMs);
        }
        
        card.reviews++;
        saveFlashcards();
    }
    
    currentCardIndex++;
    mostrarCardAtual();
}

function encerrarRevisao() {
    document.getElementById('fc-review-area').style.display = 'none';
    document.getElementById('fc-dashboard-area').style.display = 'block';
    renderFlashcardDashboard();
}

// UI Functions

function renderFlashcardDashboard() {
    const stats = getDeckStats();
    let totalPendentes = 0;
    let totalNovos = 0;
    
    const deckList = document.getElementById('fc-deck-list');
    deckList.innerHTML = '';
    
    if (stats.length === 0) {
        deckList.innerHTML = '<p style="color:var(--text-muted); padding:20px; text-align:center;">Nenhum baralho criado. Clique em "Novo Card" para começar!</p>';
    } else {
        stats.forEach(s => {
            totalPendentes += s.due;
            totalNovos += s.new;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${s.deck}</td>
                <td><span class="fc-badge new">${s.new}</span></td>
                <td><span class="fc-badge due">${s.due}</span></td>
                <td><span class="fc-badge total">${s.total}</span></td>
                <td>
                    <button class="btn-primary btn-sm" onclick="iniciarRevisao('${s.deck}')">Revisar</button>
                    <button class="btn-secondary btn-sm" onclick="exportarDeck('${s.deck}')" title="Exportar JSON"><i class="ph ph-export"></i></button>
                    <button class="btn-danger btn-sm" onclick="excluirDeck('${s.deck}')" title="Excluir Baralho"><i class="ph ph-trash"></i></button>
                </td>
            `;
            deckList.appendChild(tr);
        });
    }
    
    document.getElementById('fc-total-pendentes').textContent = totalPendentes + totalNovos;
    document.getElementById('fc-btn-iniciar-tudo').disabled = flashcards.length === 0;
}

function abrirModalNovoCard() {
    document.getElementById('fc-modal-card').classList.add('is-open');
    document.getElementById('fc-form-card').reset();
    document.getElementById('fc-card-id').value = '';
    
    // Obter disciplinas do banco de questões (global app.js) e decks existentes
    let disciplinas = [];
    if (typeof bancoQuestoes !== 'undefined') {
        disciplinas = [...new Set(bancoQuestoes.map(q => q.disciplina))];
    }
    const existingDecks = flashcards.map(c => c.deck);
    
    // Unir todas as opções únicas e ordenar
    const options = [...new Set([...disciplinas, ...existingDecks])].filter(Boolean).sort();
    
    const select = document.getElementById('fc-input-deck-select');
    select.innerHTML = '<option value="" disabled selected>Selecione um baralho...</option>';
    
    options.forEach(opt => {
        select.innerHTML += `<option value="${opt}">${opt}</option>`;
    });
    
    select.innerHTML += '<option value="custom">+ Novo Baralho Personalizado...</option>';
    
    fcToggleCustomDeck(); // Reseta a visibilidade
}

function fcToggleCustomDeck() {
    const select = document.getElementById('fc-input-deck-select');
    const customInput = document.getElementById('fc-input-deck-custom');
    
    if (select.value === 'custom') {
        customInput.style.display = 'block';
        customInput.setAttribute('required', 'true');
    } else {
        customInput.style.display = 'none';
        customInput.removeAttribute('required');
    }
}

function fecharModalCard() {
    document.getElementById('fc-modal-card').classList.remove('is-open');
}

function salvarFormCard(e) {
    e.preventDefault();
    const id = document.getElementById('fc-card-id').value;
    
    const selectValue = document.getElementById('fc-input-deck-select').value;
    const customValue = document.getElementById('fc-input-deck-custom').value;
    
    let deck = selectValue;
    if (selectValue === 'custom') {
        deck = customValue;
    }
    
    if (!deck) {
        alert("Por favor, selecione ou digite um nome para o baralho.");
        return;
    }
    
    const front = document.getElementById('fc-input-front').value;
    const back = document.getElementById('fc-input-back').value;
    
    if (id) {
        editarCard(id, deck, front, back);
    } else {
        criarCard(deck, front, back);
    }
    
    fecharModalCard();
}

function excluirDeck(deck) {
    if (confirm(`Tem certeza que deseja excluir o baralho "${deck}" e todos os seus cards?`)) {
        flashcards = flashcards.filter(c => c.deck !== deck);
        saveFlashcards();
        renderFlashcardDashboard();
    }
}

// Exportar e Importar
function exportarDeck(deck) {
    const cards = deck ? flashcards.filter(c => c.deck === deck) : flashcards;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cards));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `flashcards_${deck || 'todos'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function acionarImportacao() {
    document.getElementById('fc-file-import').click();
}

function importarDecks(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedCards = JSON.parse(event.target.result);
            if (!Array.isArray(importedCards)) throw new Error("Formato inválido");
            
            // Reatribuir IDs para evitar colisão e resetar stats de repetição (opcional)
            let importedCount = 0;
            importedCards.forEach(c => {
                if (c.front && c.back) {
                    flashcards.push({
                        id: "fc_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
                        deck: c.deck || "Importados",
                        front: c.front,
                        back: c.back,
                        created: Date.now(),
                        interval: 0,
                        ease: 2.5,
                        due: Date.now(),
                        reviews: 0,
                        lapses: 0
                    });
                    importedCount++;
                }
            });
            
            saveFlashcards();
            renderFlashcardDashboard();
            alert(`${importedCount} flashcards importados com sucesso!`);
        } catch (error) {
            alert("Erro ao importar arquivo. Certifique-se de que é um JSON válido exportado deste aplicativo.");
        }
        e.target.value = ''; // Reset file input
    };
    reader.readAsText(file);
}

// Utils
function formatText(text) {
    if (!text) return '';
    // Simples formatação: quebras de linha
    let html = text.replace(/\n/g, '<br>');
    // Negrito simples **texto**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        saveFlashcards();
    }
    
    currentCardIndex++;
    mostrarCardAtual();
}

function encerrarRevisao() {
    document.getElementById('fc-review-area').style.display = 'none';
    document.getElementById('fc-dashboard-area').style.display = 'block';
    renderFlashcardDashboard();
}

// UI Functions

function renderFlashcardDashboard() {
    const stats = getDeckStats();
    let totalPendentes = 0;
    let totalNovos = 0;
    
    const deckList = document.getElementById('fc-deck-list');
    deckList.innerHTML = '';
    
    if (stats.length === 0) {
        deckList.innerHTML = '<p style="color:var(--text-muted); padding:20px; text-align:center;">Nenhum baralho criado. Clique em "Novo Card" para começar!</p>';
    } else {
        stats.forEach(s => {
            totalPendentes += s.due;
            totalNovos += s.new;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${s.deck}</td>
                <td><span class="fc-badge new">${s.new}</span></td>
                <td><span class="fc-badge due">${s.due}</span></td>
                <td><span class="fc-badge total">${s.total}</span></td>
                <td>
                    <button class="btn-primary btn-sm" onclick="iniciarRevisao('${s.deck}')">Revisar</button>
                    <button class="btn-secondary btn-sm" onclick="exportarDeck('${s.deck}')" title="Exportar JSON"><i class="ph ph-export"></i></button>
                    <button class="btn-danger btn-sm" onclick="excluirDeck('${s.deck}')" title="Excluir Baralho"><i class="ph ph-trash"></i></button>
                </td>
            `;
            deckList.appendChild(tr);
        });
    }
    
    document.getElementById('fc-total-pendentes').textContent = totalPendentes + totalNovos;
    document.getElementById('fc-btn-iniciar-tudo').disabled = flashcards.length === 0;
}

function abrirModalNovoCard() {
    document.getElementById('fc-modal-card').classList.add('is-open');
    document.getElementById('fc-form-card').reset();
    document.getElementById('fc-card-id').value = '';
    
    // Obter disciplinas do banco de questões (global app.js) e decks existentes
    let disciplinas = [];
    if (typeof bancoQuestoes !== 'undefined') {
        disciplinas = [...new Set(bancoQuestoes.map(q => q.disciplina))];
    }
    const existingDecks = flashcards.map(c => c.deck);
    
    // Unir todas as opções únicas e ordenar
    const options = [...new Set([...disciplinas, ...existingDecks])].filter(Boolean).sort();
    
    const select = document.getElementById('fc-input-deck-select');
    select.innerHTML = '<option value="" disabled selected>Selecione um baralho...</option>';
    
    options.forEach(opt => {
        select.innerHTML += `<option value="${opt}">${opt}</option>`;
    });
    
    select.innerHTML += '<option value="custom">+ Novo Baralho Personalizado...</option>';
    
    fcToggleCustomDeck(); // Reseta a visibilidade
}

function fcToggleCustomDeck() {
    const select = document.getElementById('fc-input-deck-select');
    const customInput = document.getElementById('fc-input-deck-custom');
    
    if (select.value === 'custom') {
        customInput.style.display = 'block';
        customInput.setAttribute('required', 'true');
    } else {
        customInput.style.display = 'none';
        customInput.removeAttribute('required');
    }
}

function fecharModalCard() {
    document.getElementById('fc-modal-card').classList.remove('is-open');
}

function salvarFormCard(e) {
    e.preventDefault();
    const id = document.getElementById('fc-card-id').value;
    
    const selectValue = document.getElementById('fc-input-deck-select').value;
    const customValue = document.getElementById('fc-input-deck-custom').value;
    
    let deck = selectValue;
    if (selectValue === 'custom') {
        deck = customValue;
    }
    
    if (!deck) {
        alert("Por favor, selecione ou digite um nome para o baralho.");
        return;
    }
    
    const front = document.getElementById('fc-input-front').value;
    const back = document.getElementById('fc-input-back').value;
    
    if (id) {
        editarCard(id, deck, front, back);
    } else {
        criarCard(deck, front, back);
    }
    
    fecharModalCard();
}

function excluirDeck(deck) {
    if (confirm(`Tem certeza que deseja excluir o baralho "${deck}" e todos os seus cards?`)) {
        flashcards = flashcards.filter(c => c.deck !== deck);
        saveFlashcards();
        renderFlashcardDashboard();
    }
}

// Exportar e Importar
function exportarDeck(deck) {
    const cards = deck ? flashcards.filter(c => c.deck === deck) : flashcards;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cards));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `flashcards_${deck || 'todos'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function acionarImportacao() {
    document.getElementById('fc-file-import').click();
}

function importarDecks(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedCards = JSON.parse(event.target.result);
            if (!Array.isArray(importedCards)) throw new Error("Formato inválido");
            
            // Reatribuir IDs para evitar colisão e resetar stats de repetição (opcional)
            let importedCount = 0;
            importedCards.forEach(c => {
                if (c.front && c.back) {
                    flashcards.push({
                        id: "fc_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
                        deck: c.deck || "Importados",
                        front: c.front,
                        back: c.back,
                        created: Date.now(),
                        interval: 0,
                        ease: 2.5,
                        due: Date.now(),
                        reviews: 0,
                        lapses: 0
                    });
                    importedCount++;
                }
            });
            
            saveFlashcards();
            renderFlashcardDashboard();
            alert(`${importedCount} flashcards importados com sucesso!`);
        } catch (error) {
            alert("Erro ao importar arquivo. Certifique-se de que é um JSON válido exportado deste aplicativo.");
        }
        e.target.value = ''; // Reset file input
    };
    reader.readAsText(file);
}

// Utils
function formatText(text) {
    if (!text) return '';
    // Simples formatação: quebras de linha
    let html = text.replace(/\n/g, '<br>');
    // Negrito simples **texto**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Itálico simples *texto*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return html;
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadFlashcards();
    document.getElementById('fc-form-card').addEventListener('submit', salvarFormCard);
    document.getElementById('fc-file-import').addEventListener('change', importarDecks);
    
    // Fechar modais com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modais = ['fc-modal-card', 'fc-modal-gerenciar', 'fc-modal-stats'];
            modais.forEach(id => {
                const modal = document.getElementById(id);
                if (modal && modal.classList.contains('is-open')) {
                    modal.classList.remove('is-open');
                }
            });
        }
    });
});


// ==========================================
// GERENCIAR CARDS
// ==========================================
function abrirModalGerenciar() {
    document.getElementById('fc-modal-gerenciar').classList.add('is-open');
    const select = document.getElementById('fc-filter-deck-gerenciar');
    const decks = [...new Set(flashcards.map(c => c.deck))].sort();
    
    select.innerHTML = '<option value="">Todos os Baralhos</option>';
    decks.forEach(d => {
        select.innerHTML += `<option value="${d}">${d}</option>`;
    });
    
    document.getElementById('fc-search-gerenciar').value = '';
    renderGerenciarLista();
}

function fecharModalGerenciar() {
    document.getElementById('fc-modal-gerenciar').classList.remove('is-open');
}

function filtrarGerenciar() {
    renderGerenciarLista();
}

function renderGerenciarLista() {
    const search = document.getElementById('fc-search-gerenciar').value.toLowerCase();
    const deckFilter = document.getElementById('fc-filter-deck-gerenciar').value;
    const tbody = document.getElementById('fc-gerenciar-lista');
    
    tbody.innerHTML = '';
    
    const cards = flashcards.filter(c => {
        if (deckFilter && c.deck !== deckFilter) return false;
        if (search) {
            return c.front.toLowerCase().includes(search) || c.back.toLowerCase().includes(search);
        }
        return true;
    });
    
    if (cards.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color: var(--text-muted);">Nenhum card encontrado.</td></tr>';
        return;
    }
    
    cards.forEach(c => {
        const isNew = c.reviews === 0;
        const isDue = c.due <= Date.now();
        let status = '';
        if (isNew) status = '<span class="fc-badge new">Novo</span>';
        else if (isDue) status = '<span class="fc-badge due">A Revisar</span>';
        else status = `<span class="fc-badge total">Em ${Math.ceil((c.due - Date.now()) / (1000 * 60 * 60 * 24))} dias</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><div style="max-height: 60px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${formatText(c.front)}</div></td>
            <td>${c.deck}</td>
            <td>${status}</td>
            <td>
                <button class="btn-secondary btn-sm" onclick="editarCardGerenciamento('${c.id}')"><i class="ph ph-pencil"></i></button>
                <button class="btn-danger btn-sm" onclick="excluirCardUnico('${c.id}')"><i class="ph ph-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function editarCardGerenciamento(id) {
    const card = flashcards.find(c => c.id === id);
    if (!card) return;
    
    abrirModalNovoCard();
    document.getElementById('fc-card-id').value = card.id;
    
    const select = document.getElementById('fc-input-deck-select');
    const hasOption = Array.from(select.options).some(opt => opt.value === card.deck);
    
    if (hasOption) {
        select.value = card.deck;
    } else {
        select.value = 'custom';
        document.getElementById('fc-input-deck-custom').value = card.deck;
    }
    fcToggleCustomDeck();
    
    document.getElementById('fc-input-front').value = card.front;
    document.getElementById('fc-input-back').value = card.back;
}

function excluirCardUnico(id) {
    if (confirm("Excluir este card permanentemente?")) {
        excluirCard(id);
        renderGerenciarLista();
    }
}

// ==========================================
// ESTATISTICAS
// ==========================================
function abrirModalStats() {
    document.getElementById('fc-modal-stats').classList.add('is-open');
    
    const total = flashcards.length;
    let novos = 0;
    let aprendendo = 0;
    let maduros = 0; // interval >= 21
    let totalReviews = 0;
    let totalLapses = 0;
    
    flashcards.forEach(c => {
        if (c.reviews === 0) novos++;
        else if (c.interval >= 21) maduros++;
        else aprendendo++;
        
        totalReviews += c.reviews;
        totalLapses += c.lapses;
    });
    
    let retencao = 0;
    if (totalReviews > 0) {
        retencao = Math.round(((totalReviews - totalLapses) / totalReviews) * 100);
    }
    
    const content = document.getElementById('fc-stats-content');
    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div class="fc-summary-box glass-panel" style="margin-bottom: 0; flex-direction: column; align-items: flex-start; padding: 15px;">
                <span class="fc-stat-number">${total}</span>
                <span class="fc-stat-label">Total de Cards</span>
            </div>
            <div class="fc-summary-box glass-panel" style="margin-bottom: 0; flex-direction: column; align-items: flex-start; padding: 15px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.1));">
                <span class="fc-stat-number" style="color: #10b981;">${retencao}%</span>
                <span class="fc-stat-label">Taxa de Retenção</span>
            </div>
        </div>
        
        <div class="glass-panel" style="padding: 15px;">
            <h4 style="margin-bottom: 15px; color: var(--text-muted);">Maturidade dos Cards</h4>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Novos (Nunca revisados)</span>
                <strong>${novos}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Aprendendo (Intervalo &lt; 21d)</span>
                <strong>${aprendendo}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Maduros (Intervalo &ge; 21d)</span>
                <strong style="color: #10b981;">${maduros}</strong>
            </div>
        </div>
    `;
}

function fecharModalStats() {
    document.getElementById('fc-modal-stats').classList.remove('is-open');
}
