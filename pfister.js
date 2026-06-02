// ==========================================
// PFISTER — Simulador das Pirâmides Coloridas
// ==========================================

const PFISTER_COLORS = {
    'Az1': { hex: '#90CAF9', name: 'Azul 1 (claro)', family: 'Az', textColor: '#000' },
    'Az2': { hex: '#42A5F5', name: 'Azul 2 (turquesa)', family: 'Az', textColor: '#FFF' },
    'Az3': { hex: '#1976D2', name: 'Azul 3 (médio)', family: 'Az', textColor: '#FFF' },
    'Az4': { hex: '#0A1F5E', name: 'Azul 4 (escuro)', family: 'Az', textColor: '#FFF' },
    'Vm1': { hex: '#EF9A9A', name: 'Vermelho 1 (claro)', family: 'Vm', textColor: '#000' },
    'Vm2': { hex: '#E53935', name: 'Vermelho 2 (médio)', family: 'Vm', textColor: '#FFF' },
    'Vm3': { hex: '#B71C1C', name: 'Vermelho 3 (escuro)', family: 'Vm', textColor: '#FFF' },
    'Vd1': { hex: '#C8E61E', name: 'Verde 1 (lima)', family: 'Vd', textColor: '#000' },
    'Vd2': { hex: '#7CB342', name: 'Verde 2 (claro)', family: 'Vd', textColor: '#000' },
    'Vd3': { hex: '#2E7D32', name: 'Verde 3 (escuro)', family: 'Vd', textColor: '#FFF' },
    'Vd4': { hex: '#1B5E20', name: 'Verde 4 (muito escuro)', family: 'Vd', textColor: '#FFF' },
    'Vi1': { hex: '#CE93D8', name: 'Violeta 1 (claro)', family: 'Vi', textColor: '#000' },
    'Vi2': { hex: '#4A148C', name: 'Violeta 2 (escuro)', family: 'Vi', textColor: '#FFF' },
    'La1': { hex: '#FFB74D', name: 'Laranja 1 (claro)', family: 'La', textColor: '#000' },
    'La2': { hex: '#E65100', name: 'Laranja 2 (escuro)', family: 'La', textColor: '#FFF' },
    'Am1': { hex: '#FFEB00', name: 'Amarelo 1 (puro)', family: 'Am', textColor: '#000' },
    'Am2': { hex: '#FDD835', name: 'Amarelo 2 (dourado)', family: 'Am', textColor: '#000' },
    'Ma1': { hex: '#6D4C2A', name: 'Marrom 1', family: 'Ma', textColor: '#FFF' },
    'Ma2': { hex: '#3E2723', name: 'Marrom 2 (escuro)', family: 'Ma', textColor: '#FFF' },
    'Pr1': { hex: '#212121', name: 'Preto', family: 'Pr', textColor: '#FFF' },
    'Br1': { hex: '#FAFAFA', name: 'Branco', family: 'Br', textColor: '#000' },
    'Ci1': { hex: '#9E9E9E', name: 'Cinza 1 (claro)', family: 'Ci', textColor: '#000' },
    'Ci2': { hex: '#616161', name: 'Cinza 2 (escuro)', family: 'Ci', textColor: '#FFF' }
};

const PFISTER_FAMILIES = [
    { key: 'Az', name: 'Azul', codes: ['Az1','Az2','Az3','Az4'] },
    { key: 'Vm', name: 'Vermelho', codes: ['Vm1','Vm2','Vm3'] },
    { key: 'Vd', name: 'Verde', codes: ['Vd1','Vd2','Vd3','Vd4'] },
    { key: 'Vi', name: 'Violeta', codes: ['Vi1','Vi2'] },
    { key: 'La', name: 'Laranja', codes: ['La1','La2'] },
    { key: 'Am', name: 'Amarelo', codes: ['Am1','Am2'] },
    { key: 'Ma', name: 'Marrom', codes: ['Ma1','Ma2'] },
    { key: 'Pr', name: 'Preto', codes: ['Pr1'] },
    { key: 'Br', name: 'Branco', codes: ['Br1'] },
    { key: 'Ci', name: 'Cinza', codes: ['Ci1','Ci2'] }
];

const PFISTER_NORMS = {
    'Az': { expected: 8.1, pct: 18.1 },
    'Vm': { expected: 6.1, pct: 13.6 },
    'Vd': { expected: 8.9, pct: 19.7 },
    'Vi': { expected: 3.8, pct: 8.5 },
    'La': { expected: 4.9, pct: 10.8 },
    'Am': { expected: 4.3, pct: 9.5 },
    'Ma': { expected: 1.8, pct: 4.0 },
    'Pr': { expected: 2.0, pct: 4.5 },
    'Br': { expected: 3.7, pct: 8.3 },
    'Ci': { expected: 1.3, pct: 2.9 }
};

const PYRAMID_POSITIONS = ['1','2a','2b','3a','3b','3c','4a','4b','4c','4d','5a','5b','5c','5d','5e'];

const COLOR_INTERPRETATIONS = {
    'Az': { pos: 'Controle emocional, pensamento racional, capacidade de adaptação', neg: 'Excessivo: sobrecontrole emocional; Ausente: impulsividade' },
    'Vm': { pos: 'Energia, assertividade, agressividade canalizada', neg: 'Excessivo: impulsividade, dificuldade de controle de impulsos; Ausente: passividade' },
    'Vd': { pos: 'Maturidade, autorrealização, adaptação social', neg: 'Excessivo: rigidez; Ausente: dificuldade de autoafirmação' },
    'Vi': { pos: 'Sensibilidade interpessoal, empatia', neg: 'Excessivo: ansiedade, insegurança; Ausente: rigidez emocional' },
    'La': { pos: 'Criatividade, extroversão, sociabilidade', neg: 'Excessivo: busca de atenção; Ausente: introversão' },
    'Am': { pos: 'Vitalidade, otimismo, curiosidade intelectual', neg: 'Excessivo: grandiosidade; Ausente: indicadores depressivos' },
    'Ma': { pos: 'Perseverança, tenacidade, determinação', neg: 'Excessivo: teimosia, pensamento concreto' },
    'Pr': { pos: 'Profundidade, introspecção', neg: 'Excessivo: indicadores depressivos, negativismo' },
    'Br': { pos: 'Abertura, clareza', neg: 'Excessivo: vazio, evitação' },
    'Ci': { pos: 'Cautela, neutralidade', neg: 'Excessivo: repressão, evasão' }
};

// State
let pfisterState = null;

function initPfister() {
    pfisterState = {
        currentPyramid: 0,
        pyramids: [
            { cells: {}, chronology: [], substitutions: 0, removals: 0 },
            { cells: {}, chronology: [], substitutions: 0, removals: 0 },
            { cells: {}, chronology: [], substitutions: 0, removals: 0 }
        ],
        inquiry: {},
        phase: 'intro' // 'intro', 'pyramid', 'inquiry', 'report'
    };
    renderIntroPhase();
}

function renderIntroPhase() {
    const container = document.getElementById('psico-test-container');
    let html = `<div class="glass-panel pfister-intro">
        <h3><i class="ph ph-info"></i> Instruções do Teste</h3>
        <p style="color: var(--text-muted); margin-bottom: 20px;">O Teste das Pirâmides Coloridas de Pfister avalia aspectos da dinâmica emocional e da personalidade.</p>
        
        <div class="pfister-intro-steps">
            <div class="intro-step">
                <div class="step-icon"><i class="ph ph-number-circle-one"></i></div>
                <div><strong>Monte três pirâmides:</strong> Você deverá preencher todos os quadrículos de três pirâmides sucessivas.</div>
            </div>
            <div class="intro-step">
                <div class="step-icon"><i class="ph ph-number-circle-two"></i></div>
                <div><strong>Escolha as cores:</strong> Clique em cada quadrículo vazio e selecione a cor que achar mais bonita no momento. Tente agir com naturalidade, não há limite de tempo.</div>
            </div>
            <div class="intro-step">
                <div class="step-icon"><i class="ph ph-number-circle-three"></i></div>
                <div><strong>Inquérito Final:</strong> Após completar as três pirâmides, você responderá a cinco perguntas rápidas para gerar o seu relatório detalhado.</div>
            </div>
        </div>
        
        <div class="pfister-controls" style="margin-top: 30px;">
            <button class="btn-primary" onclick="pfisterState.phase='pyramid'; renderPyramidPhase();"><i class="ph ph-play"></i> Começar o Teste</button>
        </div>
    </div>`;
    container.innerHTML = html;
}

// ==========================================
// PYRAMID SVG RENDERING
// ==========================================

function getCellLayout() {
    const cellSize = 48;
    const gap = 2;
    const rows = [
        { positions: ['1'], count: 1 },
        { positions: ['2a','2b'], count: 2 },
        { positions: ['3a','3b','3c'], count: 3 },
        { positions: ['4a','4b','4c','4d'], count: 4 },
        { positions: ['5a','5b','5c','5d','5e'], count: 5 }
    ];
    const maxCols = 5;
    const totalWidth = maxCols * cellSize + (maxCols - 1) * gap;
    const totalHeight = 5 * cellSize + 4 * gap;
    const padding = 12;
    const svgWidth = totalWidth + padding * 2;
    const svgHeight = totalHeight + padding * 2;

    const cells = [];
    rows.forEach((row, ri) => {
        const rowWidth = row.count * cellSize + (row.count - 1) * gap;
        const startX = padding + (totalWidth - rowWidth) / 2;
        const y = padding + ri * (cellSize + gap);
        row.positions.forEach((pos, ci) => {
            cells.push({
                pos,
                x: startX + ci * (cellSize + gap),
                y,
                w: cellSize,
                h: cellSize
            });
        });
    });
    return { cells, svgWidth, svgHeight };
}

function renderPyramidSVG(pyramidData, interactive, scale) {
    scale = scale || 1;
    const layout = getCellLayout();
    const w = Math.round(layout.svgWidth * scale);
    const h = Math.round(layout.svgHeight * scale);

    let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${layout.svgWidth} ${layout.svgHeight}" xmlns="http://www.w3.org/2000/svg" style="background:#F5EFE0; border:1px solid #7B6E4A; border-radius:8px;">`;

    layout.cells.forEach(cell => {
        const colorCode = pyramidData.cells[cell.pos];
        const colorData = colorCode ? PFISTER_COLORS[colorCode] : null;
        const fill = colorData ? colorData.hex : '#E0E0E0';
        const stroke = colorData ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)';
        const textColor = colorData ? colorData.textColor : '#999';
        const cursor = interactive ? 'pointer' : 'default';
        const label = colorCode || '+';
        const fontSize = colorCode ? 10 * scale : 16 * scale;
        const fontWeight = colorCode ? 'bold' : 'normal';

        svg += `<rect x="${cell.x}" y="${cell.y}" width="${cell.w}" height="${cell.h}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="1" style="cursor:${cursor}" ${interactive ? `data-pos="${cell.pos}" class="pfister-svg-cell"` : ''}/>`;
        svg += `<text x="${cell.x + cell.w/2}" y="${cell.y + cell.h/2 + 4}" text-anchor="middle" font-family="Inter, Arial" font-size="${fontSize}" font-weight="${fontWeight}" fill="${textColor}" style="pointer-events:none">${label}</text>`;
    });

    svg += '</svg>';
    return svg;
}

// ==========================================
// PYRAMID PHASE RENDERING
// ==========================================

function renderPyramidPhase() {
    const container = document.getElementById('psico-test-container');
    const pi = pfisterState.currentPyramid;
    const pData = pfisterState.pyramids[pi];
    const filledCount = Object.keys(pData.cells).length;
    const progress = ((pi * 15 + filledCount) / 45 * 100).toFixed(0);

    let html = `<div class="glass-panel pfister-pyramid-area">`;

    // Progress
    html += `<div class="pfister-progress">
        <span class="pfister-progress-text">Pirâmide ${pi + 1} de 3</span>
        <div class="pfister-progress-bar"><div class="pfister-progress-fill" style="width:${progress}%"></div></div>
        <span class="pfister-progress-text" style="color:var(--accent-color)">${progress}%</span>
    </div>`;

    // Title
    html += `<div class="pfister-pyramid-title"><i class="ph ph-triangle" style="color:var(--accent-color)"></i> Pirâmide ${['I','II','III'][pi]}</div>`;

    // SVG
    html += `<div class="pfister-pyramid-svg-wrapper" id="pfister-svg-container">${renderPyramidSVG(pData, true, 1.2)}</div>`;

    // Cell count
    html += `<div class="pfister-cell-count">${filledCount} de 15 quadrículos preenchidos</div>`;

    // Controls
    html += `<div class="pfister-controls">`;
    html += `<button class="btn-secondary" onclick="pfisterClearPyramid()"><i class="ph ph-eraser"></i> Limpar Pirâmide</button>`;
    if (filledCount === 15) {
        if (pi < 2) {
            html += `<button class="btn-primary" onclick="pfisterNextPyramid()"><i class="ph ph-arrow-right"></i> Próxima Pirâmide</button>`;
        } else {
            html += `<button class="btn-primary" onclick="pfisterShowInquiry()"><i class="ph ph-clipboard-text"></i> Ir para o Inquérito</button>`;
        }
    }
    html += `</div>`;
    html += `</div>`;

    container.innerHTML = html;

    // Attach click events to SVG cells
    document.querySelectorAll('.pfister-svg-cell').forEach(rect => {
        rect.addEventListener('click', (e) => {
            const pos = e.target.getAttribute('data-pos');
            if (pos) showColorPalette(pos);
        });
    });
}

// ==========================================
// COLOR PALETTE POPUP
// ==========================================

function showColorPalette(position) {
    const pi = pfisterState.currentPyramid;
    const pData = pfisterState.pyramids[pi];
    const currentColor = pData.cells[position];

    let html = `<div class="pfister-palette-overlay" id="pfister-palette-overlay">
        <div class="pfister-palette">
            <div class="pfister-palette-header">
                <h3><i class="ph ph-palette"></i> Posição ${position.toUpperCase()}</h3>
                <button class="pfister-palette-close" onclick="closePalette()"><i class="ph ph-x"></i></button>
            </div>`;

    PFISTER_FAMILIES.forEach(fam => {
        html += `<div class="pfister-palette-group">
            <div class="pfister-palette-group-title">${fam.name} (${fam.key})</div>
            <div class="pfister-palette-swatches">`;
        fam.codes.forEach(code => {
            const c = PFISTER_COLORS[code];
            html += `<div class="pfister-swatch" data-code="${code}" style="background:${c.hex}; color:${c.textColor}" onclick="selectColor('${position}','${code}')" title="${c.name}">${code}</div>`;
        });
        html += `</div></div>`;
    });

    // Remove button (if cell is filled)
    if (currentColor) {
        html += `<button class="pfister-btn-remove" onclick="removeColor('${position}')"><i class="ph ph-trash"></i> Remover cor</button>`;
    }

    html += `</div></div>`;

    document.body.insertAdjacentHTML('beforeend', html);

    // Close on overlay click
    document.getElementById('pfister-palette-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'pfister-palette-overlay') closePalette();
    });
}

function closePalette() {
    const overlay = document.getElementById('pfister-palette-overlay');
    if (overlay) overlay.remove();
}

function selectColor(position, code) {
    const pi = pfisterState.currentPyramid;
    const pData = pfisterState.pyramids[pi];
    const oldColor = pData.cells[position];

    if (oldColor) {
        pData.substitutions++;
        pData.chronology.push({ pos: position, color: code, type: 'sub', replaced: oldColor });
    } else {
        pData.chronology.push({ pos: position, color: code, type: 'place' });
    }

    pData.cells[position] = code;
    closePalette();
    renderPyramidPhase();
}

function removeColor(position) {
    const pi = pfisterState.currentPyramid;
    const pData = pfisterState.pyramids[pi];
    const oldColor = pData.cells[position];

    if (oldColor) {
        pData.removals++;
        pData.chronology.push({ pos: position, color: oldColor, type: 'rem' });
        delete pData.cells[position];
    }

    closePalette();
    renderPyramidPhase();
}

function pfisterClearPyramid() {
    if (!confirm('Limpar toda a pirâmide atual?')) return;
    const pi = pfisterState.currentPyramid;
    pfisterState.pyramids[pi] = { cells: {}, chronology: [], substitutions: 0, removals: 0 };
    renderPyramidPhase();
}

function pfisterNextPyramid() {
    pfisterState.currentPyramid++;
    renderPyramidPhase();
}

// ==========================================
// INQUIRY PHASE
// ==========================================

function pfisterShowInquiry() {
    pfisterState.phase = 'inquiry';
    const container = document.getElementById('psico-test-container');

    let html = `<div class="glass-panel pfister-inquiry">
        <h3><i class="ph ph-clipboard-text"></i> Inquérito Pós-Teste</h3>`;

    // Mini pyramids for reference
    html += `<div class="pfister-inquiry-pyramids">`;
    for (let i = 0; i < 3; i++) {
        html += `<div class="pfister-inquiry-pyramid-mini">
            ${renderPyramidSVG(pfisterState.pyramids[i], false, 0.5)}
            <p>Pirâmide ${['I','II','III'][i]}</p>
        </div>`;
    }
    html += `</div>`;

    // Q1: Mais bonita
    html += `<div class="form-group">
        <label>1. Qual pirâmide ficou mais bonita?</label>
        <div class="pfister-radio-group">
            ${['I','II','III'].map((n,i) => `<div class="pfister-radio-option">
                <input type="radio" name="inq-bonita" id="inq-bonita-${i}" value="${i}">
                <label for="inq-bonita-${i}">Pirâmide ${n}</label>
            </div>`).join('')}
        </div>
    </div>`;

    // Q2: Menos bonita
    html += `<div class="form-group">
        <label>2. Qual pirâmide ficou menos bonita?</label>
        <div class="pfister-radio-group">
            ${['I','II','III'].map((n,i) => `<div class="pfister-radio-option">
                <input type="radio" name="inq-feia" id="inq-feia-${i}" value="${i}">
                <label for="inq-feia-${i}">Pirâmide ${n}</label>
            </div>`).join('')}
        </div>
    </div>`;

    // Color dropdowns
    const colorOptions = Object.keys(PFISTER_COLORS).map(code => {
        const c = PFISTER_COLORS[code];
        return `<option value="${code}">${code} — ${c.name}</option>`;
    }).join('');

    html += `<div class="form-group">
        <label for="inq-cor-gostou">3. Qual cor você mais gostou?</label>
        <select id="inq-cor-gostou"><option value="" disabled selected>Selecione...</option>${colorOptions}</select>
    </div>`;

    html += `<div class="form-group">
        <label for="inq-cor-menos">4. Qual cor você menos gostou?</label>
        <select id="inq-cor-menos"><option value="" disabled selected>Selecione...</option>${colorOptions}</select>
    </div>`;

    html += `<div class="form-group">
        <label for="inq-cor-preferida">5. Qual sua cor preferida?</label>
        <select id="inq-cor-preferida"><option value="" disabled selected>Selecione...</option>${colorOptions}</select>
    </div>`;

    html += `<div class="pfister-controls">
        <button class="btn-primary" onclick="pfisterSubmitInquiry()"><i class="ph ph-chart-bar"></i> Gerar Relatório</button>
    </div>`;

    html += `</div>`;
    container.innerHTML = html;
}

function pfisterSubmitInquiry() {
    const bonita = document.querySelector('input[name="inq-bonita"]:checked');
    const feia = document.querySelector('input[name="inq-feia"]:checked');
    const corGostou = document.getElementById('inq-cor-gostou').value;
    const corMenos = document.getElementById('inq-cor-menos').value;
    const corPref = document.getElementById('inq-cor-preferida').value;

    if (!bonita || !feia || !corGostou || !corMenos || !corPref) {
        alert('Por favor, responda todas as perguntas antes de continuar.');
        return;
    }
    
    if (bonita.value === feia.value) {
        alert('A pirâmide mais bonita não pode ser a mesma que a menos bonita.');
        return;
    }

    pfisterState.inquiry = {
        bonitaIdx: parseInt(bonita.value),
        feiaIdx: parseInt(feia.value),
        corGostou,
        corMenos,
        corPreferida: corPref
    };

    pfisterState.phase = 'report';
    generateReport();
}

// ==========================================
// ANALYSIS FUNCTIONS
// ==========================================

function analyzeColors() {
    const allCells = [];
    pfisterState.pyramids.forEach(p => {
        PYRAMID_POSITIONS.forEach(pos => {
            if (p.cells[pos]) allCells.push(p.cells[pos]);
        });
    });

    const familyCounts = {};
    PFISTER_FAMILIES.forEach(f => { familyCounts[f.key] = 0; });
    allCells.forEach(code => {
        const fam = PFISTER_COLORS[code].family;
        familyCounts[fam]++;
    });

    const total = allCells.length;
    const result = {};
    PFISTER_FAMILIES.forEach(f => {
        const obs = familyCounts[f.key];
        const obsPct = total > 0 ? (obs / total * 100) : 0;
        const norm = PFISTER_NORMS[f.key];
        let status = '=';
        if (obsPct > norm.pct + 5) status = '↑';
        else if (obsPct < norm.pct - 3) status = '↓';
        result[f.key] = { obs, obsPct: obsPct.toFixed(1), expected: norm.expected, expPct: norm.pct.toFixed(1), status };
    });

    return result;
}

function analyzeChromaticFormula() {
    const familiesPerPyramid = pfisterState.pyramids.map(p => {
        const fams = new Set();
        Object.values(p.cells).forEach(code => {
            fams.add(PFISTER_COLORS[code].family);
        });
        return fams;
    });

    let CA = 0, CR = 0, V = 0, AUS = 0;
    const caList = [], crList = [], vList = [], ausList = [];

    PFISTER_FAMILIES.forEach(f => {
        let count = 0;
        familiesPerPyramid.forEach(fams => { if (fams.has(f.key)) count++; });
        if (count === 3) { CA++; caList.push(f.key); }
        else if (count === 2) { CR++; crList.push(f.key); }
        else if (count === 1) { V++; vList.push(f.key); }
        else { AUS++; ausList.push(f.key); }
    });

    return { CA, CR, V, AUS, caList, crList, vList, ausList };
}

function analyzeSyndromes(colorAnalysis) {
    const getObs = (fam) => parseInt(colorAnalysis[fam].obs);
    return {
        normal: { obs: getObs('Az') + getObs('Vm') + getObs('Vd'), expected: 23.1, name: 'Normal (Az+Vm+Vd)' },
        estimulo: { obs: getObs('Vm') + getObs('Am') + getObs('La'), expected: 15.3, name: 'Estímulo (Vm+Am+La)' },
        fria: { obs: getObs('Az') + getObs('Vd') + getObs('Vi'), expected: 20.8, name: 'Fria (Az+Vd+Vi)' },
        incolor: { obs: getObs('Pr') + getObs('Br') + getObs('Ci'), expected: 7.0, name: 'Incolor (Pr+Br+Ci)' }
    };
}

function analyzeFormal(pyramidData) {
    const cells = pyramidData.cells;
    const getFamily = (pos) => {
        const code = cells[pos];
        return code ? PFISTER_COLORS[code].family : null;
    };

    // Check symmetry pairs
    const symmetryPairs = [
        ['2a','2b'], ['3a','3c'], ['4a','4d'], ['4b','4c'], ['5a','5e'], ['5b','5d']
    ];
    let symMatches = 0;
    symmetryPairs.forEach(([a, b]) => {
        if (getFamily(a) && getFamily(a) === getFamily(b)) symMatches++;
    });

    // Count distinct families
    const families = new Set();
    Object.values(cells).forEach(code => { families.add(PFISTER_COLORS[code].family); });
    const numFamilies = families.size;

    // Check horizontal layers (rows with same family)
    const rows = [['1'],['2a','2b'],['3a','3b','3c'],['4a','4b','4c','4d'],['5a','5b','5c','5d','5e']];
    let layerRows = 0;
    rows.forEach(row => {
        const fams = row.map(pos => getFamily(pos)).filter(f => f);
        if (fams.length === row.length && new Set(fams).size === 1) layerRows++;
    });

    // Determine formal aspect
    let formal;
    let sinaisEspeciais = [];

    if (numFamilies === 1 && Object.keys(cells).length === 15) {
        formal = 'camada monotonal';
    } else if (symMatches >= 5 && numFamilies >= 4) {
        formal = 'estrutura simétrica';
    } else if (symMatches >= 4 && numFamilies >= 3) {
        formal = 'formação simétrica';
    } else if (symMatches >= 3 && numFamilies >= 3) {
        formal = 'formação simétrica';
    } else if (layerRows >= 3) {
        formal = 'formação em camada';
    } else if (layerRows >= 2 || symMatches >= 2) {
        formal = 'formação';
    } else if (layerRows >= 1 || symMatches >= 1) {
        formal = 'tapete com início de ordem';
    } else {
        formal = 'tapete puro';
    }

    // Detecção de Sinais Especiais
    const topRowWhite = (getFamily('1') === 'Br') && (getFamily('2a') === 'Br') && (getFamily('2b') === 'Br');
    if (topRowWhite && numFamilies > 1) {
        sinaisEspeciais.push('decepada');
    }
    
    const row3White = getFamily('3a') === 'Br' && getFamily('3b') === 'Br' && getFamily('3c') === 'Br';
    const row4White = getFamily('4a') === 'Br' && getFamily('4b') === 'Br' && getFamily('4c') === 'Br' && getFamily('4d') === 'Br';
    if ((row3White || row4White) && numFamilies > 1) {
        sinaisEspeciais.push('corte (mutilação)');
    }

    // Placement mode
    const chron = pyramidData.chronology.filter(e => e.type === 'place' || e.type === 'sub');
    let mode = '';
    if (chron.length >= 5) {
        const firstRows = chron.slice(0, 5).map(e => parseInt(e.pos.charAt(0)));
        const isAscendente = firstRows[0] >= 4;
        const isDescendente = firstRows[0] <= 2;
        mode = isAscendente ? 'ascendente' : (isDescendente ? 'descendente' : 'mista');

        // Check left-right
        const firstCols = chron.slice(0, 5).map(e => {
            const p = e.pos;
            if (p.length === 1) return 0;
            return p.charCodeAt(1) - 97; // a=0, b=1, etc.
        });
        const leftFirst = firstCols.filter((v, i) => i > 0 && v <= firstCols[i-1]).length;
        if (leftFirst <= 1) mode += ', direta';
        else mode += ', inversa';

        if (symMatches >= 3) mode += ', simétrica';
    } else {
        mode = 'indeterminado';
    }

    return {
        formal,
        sinaisEspeciais,
        mode,
        substitutions: pyramidData.substitutions,
        removals: pyramidData.removals,
        symMatches
    };
}

function analyzeExecution() {
    // Check if all pyramids follow similar systematic approach
    const patterns = pfisterState.pyramids.map(p => {
        const placements = p.chronology.filter(e => e.type === 'place' || e.type === 'sub');
        if (placements.length < 5) return 'unknown';
        const firstRows = placements.slice(0, 5).map(e => parseInt(e.pos.charAt(0)));
        // Check if monotonic (ascending or descending row numbers)
        let ordered = true;
        for (let i = 1; i < firstRows.length; i++) {
            if (Math.abs(firstRows[i] - firstRows[i-1]) > 1) { ordered = false; break; }
        }
        return ordered ? 'ordered' : 'disordered';
    });

    const orderedCount = patterns.filter(p => p === 'ordered').length;
    if (orderedCount >= 2) return 'ORDENADA';
    if (orderedCount === 0) return 'DESORDENADA';
    return 'RELAXADA';
}

function calculateScore(colorAnalysis, formalAnalyses, execution) {
    let score = 0;
    const positives = [], warnings = [], negatives = [];

    // Formal per pyramid
    formalAnalyses.forEach((fa, i) => {
        const label = ['I','II','III'][i];
        if (fa.formal === 'estrutura simétrica') {
            score += 3;
            positives.push(`Pirâmide ${label}: estrutura simétrica — indica funcionamento cognitivo elaborado e equilíbrio emocional.`);
        } else if (fa.formal === 'formação simétrica') {
            score += 2;
            positives.push(`Pirâmide ${label}: formação simétrica — nível intermediário de elaboração; aceitável.`);
        } else if (fa.formal.includes('formação')) {
            score += 1;
            positives.push(`Pirâmide ${label}: ${fa.formal} — organização básica presente.`);
        } else if (fa.formal === 'camada monotonal') {
            warnings.push(`Pirâmide ${label}: camada monotonal — nível intermediário de elaboração, porém sugere certa rigidez ou fuga.`);
        } else if (fa.formal === 'tapete com início de ordem') {
            warnings.push(`Pirâmide ${label}: tapete (com início de ordem) — funcionamento mais simples; observar demais indicadores.`);
        } else {
            score -= 2;
            negatives.push(`Pirâmide ${label}: ${fa.formal} — ausência de organização; possível indicador de imaturidade emocional.`);
        }

        if (fa.sinaisEspeciais && fa.sinaisEspeciais.includes('decepada')) {
            score -= 2;
            negatives.push(`Pirâmide ${label}: sinal especial 'decepada' — requer atenção (possível fragilidade estrutural).`);
        }
        if (fa.sinaisEspeciais && fa.sinaisEspeciais.includes('corte (mutilação)')) {
            score -= 2;
            negatives.push(`Pirâmide ${label}: sinal especial 'corte (mutilação)' — requer atenção (possível fragilidade ou dissociação).`);
        }
    });

    // Colors
    const ca = colorAnalysis;
    if (ca['Vm'].status === '=') { score += 2; positives.push('Vermelho dentro do esperado — agressividade canalizada.'); }
    else if (ca['Vm'].status === '↑') { score -= 3; negatives.push('Vermelho elevado — possível dificuldade no controle de impulsos agressivos.'); }

    if (ca['Az'].status === '=' || ca['Az'].status === '↑') { score += 2; positives.push('Azul dentro do esperado — bom controle emocional e capacidade de adaptação.'); }
    else if (ca['Az'].obs === 0) { score -= 2; negatives.push('Azul rebaixado ou ausente — possível dificuldade de autocontrole e contenção emocional, fator crítico para policiais.'); }

    if (ca['Vd'].status === '=' || ca['Vd'].status === '↑') { score += 1; }
    else if (ca['Vd'].obs === 0) { score -= 1; warnings.push('Verde rebaixado ou ausente — possível dificuldade de contato afetivo e empatia.'); }

    if (ca['Ma'].obs > 0 && ca['Ma'].obs <= 5) { score += 1; positives.push('Marrom presente — perseverança, tenacidade, determinação (boa qualidade para o cargo).'); }
    else if (ca['Ma'].obs > 5) { score -= 1; warnings.push('Marrom excessivo — possível rigidez ou pensamento concreto.'); }

    if (ca['Pr'].obs > 5) { score -= 2; negatives.push('Preto elevado — repressão acentuada ou possíveis indicadores depressivos.'); }
    
    if (ca['Br'].obs > 5) { score -= 2; negatives.push('Branco elevado — vazio interior, fragilidade estrutural ou impulsividade não controlada.'); }
    
    // Syndromes
    const synIncolor = parseInt(ca['Pr'].obs) + parseInt(ca['Br'].obs) + parseInt(ca['Ci'].obs);
    if (synIncolor > 14) { 
        score -= 3;
        negatives.push(`Síndrome incolor elevada (${synIncolor} vs. esperado 7) — repressão ou negação de afetos. Crítico para PF.`);
    }

    // Execution
    if (execution === 'ORDENADA') { score += 2; positives.push('Execução ordenada — método com flexibilidade; indica organização e adaptabilidade.'); }
    else if (execution === 'DESORDENADA') { score -= 2; negatives.push('Execução desordenada — possível desorganização ou impulsividade.'); }

    // Substitutions
    const totalSubs = formalAnalyses.reduce((s, fa) => s + fa.substitutions, 0);
    if (totalSubs === 0) { score += 1; }
    else if (totalSubs >= 5) { score -= 1; warnings.push('Número elevado de substituições — possível indecisão ou insegurança.'); }

    let recommendation;
    if (score >= 5) recommendation = { text: 'RECOMENDADO', color: '#1B5E20', bg: '#E8F5E9' };
    else if (score >= 0) recommendation = { text: 'COM RESSALVAS', color: '#E65100', bg: '#FFF3E0' };
    else recommendation = { text: 'NÃO RECOMENDADO', color: '#C62828', bg: '#FFEBEE' };

    return { score, recommendation, positives, warnings, negatives };
}

// ==========================================
// REPORT GENERATION
// ==========================================

function generateReport() {
    const container = document.getElementById('psico-test-container');
    const colorAnalysis = analyzeColors();
    const chromaticFormula = analyzeChromaticFormula();
    const syndromes = analyzeSyndromes(colorAnalysis);
    const formalAnalyses = pfisterState.pyramids.map(p => analyzeFormal(p));
    const execution = analyzeExecution();
    const scoring = calculateScore(colorAnalysis, formalAnalyses, execution);
    const inq = pfisterState.inquiry;

    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});

    let html = `<div class="pfister-report">`;

    // Actions
    html += `<div style="display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap;">
        <button class="pfister-print-btn" onclick="window.print()"><i class="ph ph-printer"></i> Imprimir / Salvar PDF</button>
        <button class="btn-secondary" onclick="pfisterRedo()" style="display:flex;align-items:center;gap:6px;"><i class="ph ph-arrows-clockwise"></i> Refazer o Teste</button>
    </div>`;

    // Warning
    html += `<div class="pfister-warning">
        <i class="ph ph-warning"></i>
        <div><strong>Aviso:</strong> Este é um relatório de SIMULADOR EDUCACIONAL. Não substitui avaliação de psicólogo credenciado pelo CRP. A análise gerada baseia-se nos critérios do manual de Villemor-Amaral (Casa do Psicólogo / Pearson, 2005).</div>
    </div>`;

    // Title
    html += `<div class="pfister-report-section">
        <h3><i class="ph ph-file-text"></i> Teste das Pirâmides Coloridas de Pfister — Relatório Simulado</h3>
        <p style="color:var(--text-muted);font-size:0.9rem">Gerado em: ${dateStr} • Simulador educacional</p>
    </div>`;

    // === RECOMMENDATION ===
    html += `<div class="pfister-report-section">
        <h3><i class="ph ph-shield-check"></i> Parecer Simulado (Perfil Polícia)</h3>
        <p>
            <span class="pfister-recomendacao" style="background:${scoring.recommendation.color}">${scoring.recommendation.text}</span>
            <span class="pfister-score-text">Pontuação indicativa: <strong>${scoring.score >= 0 ? '+' : ''}${scoring.score}</strong></span>
        </p>
        <div class="pfister-pontos-grid">
            <div class="pfister-ponto-box pos">
                <h4>✓ Pontos Positivos</h4>
                ${scoring.positives.length > 0 ? '<ul>' + scoring.positives.map(p => `<li>${p}</li>`).join('') + '</ul>' : '<p style="font-size:0.85rem;color:var(--text-muted)"><em>(nenhum)</em></p>'}
            </div>
            <div class="pfister-ponto-box atn">
                <h4>⚠ Pontos de Atenção</h4>
                ${scoring.warnings.length > 0 ? '<ul>' + scoring.warnings.map(p => `<li>${p}</li>`).join('') + '</ul>' : '<p style="font-size:0.85rem;color:var(--text-muted)"><em>(nenhum)</em></p>'}
            </div>
            <div class="pfister-ponto-box neg">
                <h4>✗ Pontos Negativos</h4>
                ${scoring.negatives.length > 0 ? '<ul>' + scoring.negatives.map(p => `<li>${p}</li>`).join('') + '</ul>' : '<p style="font-size:0.85rem;color:var(--text-muted)"><em>(nenhum)</em></p>'}
            </div>
        </div>
    </div>`;

    // === PYRAMIDS ===
    html += `<div class="pfister-report-section">
        <h3><i class="ph ph-triangle"></i> As Três Pirâmides Montadas</h3>
        <div class="pfister-pyramids-display">`;
    for (let i = 0; i < 3; i++) {
        html += `<div class="pfister-pyramid-card">
            <h4>Pirâmide ${['I','II','III'][i]}</h4>
            ${renderPyramidSVG(pfisterState.pyramids[i], false, 0.85)}
        </div>`;
    }
    html += `</div></div>`;

    // === CELL STATE ===
    html += `<div class="pfister-report-section">
        <h3><i class="ph ph-grid-four"></i> Estado Final dos Quadrículos</h3>`;
    for (let i = 0; i < 3; i++) {
        const p = pfisterState.pyramids[i];
        const state = PYRAMID_POSITIONS.map(pos => `${pos}=${p.cells[pos] || '—'}`).join('  ');
        html += `<div class="pfister-estado"><h4>Pirâmide ${['I','II','III'][i]}</h4><pre>${state}</pre></div>`;
    }
    html += `</div>`;

    // === CHRONOLOGICAL ORDER ===
    html += `<div class="pfister-report-section">
        <h3><i class="ph ph-clock-counter-clockwise"></i> Ordem Cronológica de Colocação</h3>
        <p style="font-size:0.85rem;color:var(--text-muted)">Sequência em que os quadrículos foram preenchidos (inclui substituições e remoções).</p>`;
    for (let i = 0; i < 3; i++) {
        const chron = pfisterState.pyramids[i].chronology;
        html += `<div class="pfister-cron"><h4>Pirâmide ${['I','II','III'][i]}</h4><div class="pfister-cron-items">`;
        chron.forEach((entry, idx) => {
            let cls = '';
            let label = `${idx + 1}. ${entry.pos}=${entry.color}`;
            if (entry.type === 'rem') { cls = 'rem'; label = `${idx + 1}. ${entry.pos}=${entry.color} (removido)`; }
            if (entry.type === 'sub') { cls = 'sub'; label = `${idx + 1}. ${entry.pos}=${entry.color} (substituiu ${entry.replaced})`; }
            html += `<span class="${cls}">${label}</span>`;
        });
        html += `</div></div>`;
    }
    html += `</div>`;

    // === INQUIRY ===
    html += `<div class="pfister-report-section">
        <h3><i class="ph ph-chat-dots"></i> Respostas do Inquérito</h3>
        <table class="pfister-color-table">
            <thead><tr><th style="width:50%">Pergunta</th><th>Resposta</th></tr></thead>
            <tbody>
                <tr><td>Pirâmide mais bonita</td><td>Pirâmide ${['I','II','III'][inq.bonitaIdx]}</td></tr>
                <tr><td>Pirâmide menos bonita</td><td>Pirâmide ${['I','II','III'][inq.feiaIdx]}</td></tr>
                <tr><td>Cor mais gostada</td><td>${inq.corGostou} — ${PFISTER_COLORS[inq.corGostou].name}</td></tr>
                <tr><td>Cor menos gostada</td><td>${inq.corMenos} — ${PFISTER_COLORS[inq.corMenos].name}</td></tr>
                <tr><td>Cor preferida</td><td>${inq.corPreferida} — ${PFISTER_COLORS[inq.corPreferida].name}</td></tr>
            </tbody>
        </table>
    </div>`;

    // === COLOR ANALYSIS ===
    html += `<div class="pfister-report-section">
        <h3 class="section-title-with-help">
            <span><i class="ph ph-paint-bucket"></i> Análise de Cores</span>
            <button class="pfister-info-btn" onclick="showPfisterHelp('cores')" title="Entender Análise de Cores"><i class="ph ph-question"></i></button>
        </h3>
        <table class="pfister-color-table">
            <thead><tr><th>Família</th><th>Observado</th><th>Esperado</th><th>% obs.</th><th>% esp.</th><th>Status</th></tr></thead>
            <tbody>`;
    PFISTER_FAMILIES.forEach(f => {
        const ca = colorAnalysis[f.key];
        const rowClass = ca.status === '↑' ? 'row-high' : (ca.status === '↓' ? 'row-low' : 'row-ok');
        html += `<tr class="${rowClass}"><td>${f.name} (${f.key})</td><td>${ca.obs}</td><td>${ca.expected}</td><td>${ca.obsPct}%</td><td>${ca.expPct}%</td><td>${ca.status}</td></tr>`;
    });
    html += `</tbody></table>`;

    // Chromatic Formula
    html += `<h4 style="margin-top:20px">Fórmula Cromática</h4>`;
    html += `<div class="pfister-formula">CA : CR : V : AUS = ${chromaticFormula.CA} : ${chromaticFormula.CR} : ${chromaticFormula.V} : ${chromaticFormula.AUS}</div>`;
    html += `<div class="pfister-formula-detail">
        • Constantes Absolutas (CA): ${chromaticFormula.caList.join(', ') || '—'}<br>
        • Constantes Relativas (CR): ${chromaticFormula.crList.join(', ') || '—'}<br>
        • Variabilidade (V): ${chromaticFormula.vList.join(', ') || '—'}<br>
        • Ausentes (AUS): ${chromaticFormula.ausList.join(', ') || '—'}
    </div>`;

    html += `</div>`;

    // === SYNDROMES ===
    html += `<div class="pfister-report-section">
        <h3 class="section-title-with-help">
            <span><i class="ph ph-chart-pie-slice"></i> Síndromes Cromáticas</span>
            <button class="pfister-info-btn" onclick="showPfisterHelp('sindromes')" title="Entender Síndromes"><i class="ph ph-question"></i></button>
        </h3>
        <table class="pfister-color-table">
            <thead><tr><th>Síndrome</th><th>Observado</th><th>Esperado</th><th>Diferença</th></tr></thead>
            <tbody>`;
    Object.values(syndromes).forEach(s => {
        const diff = (s.obs - s.expected).toFixed(1);
        const sign = diff >= 0 ? '+' : '';
        html += `<tr><td>${s.name}</td><td>${s.obs}</td><td>${s.expected}</td><td>${sign}${diff}</td></tr>`;
    });
    html += `</tbody></table></div>`;

    // === FORMAL ANALYSIS ===
    html += `<div class="pfister-report-section">
        <h3 class="section-title-with-help">
            <span><i class="ph ph-cube"></i> Análise Formal</span>
            <button class="pfister-info-btn" onclick="showPfisterHelp('formal')" title="Entender Análise Formal"><i class="ph ph-question"></i></button>
        </h3>
        <p>Processo de execução (3 pirâmides): <strong>${execution}</strong></p>`;
    formalAnalyses.forEach((fa, i) => {
        const sinaisStr = fa.sinaisEspeciais && fa.sinaisEspeciais.length > 0 ? fa.sinaisEspeciais.join(', ') : '—';
        html += `<div class="pfister-formal-row">
            <h4>Pirâmide ${['I','II','III'][i]}</h4>
            <table class="pfister-kv-table">
                <tr><td>Aspecto formal:</td><td><strong>${fa.formal}</strong></td></tr>
                <tr><td>Modo de colocação:</td><td>${fa.mode}</td></tr>
                <tr><td>Sinais especiais:</td><td>${sinaisStr}</td></tr>
                <tr><td>Substituições:</td><td>${fa.substitutions}</td></tr>
                <tr><td>Remoções:</td><td>${fa.removals}</td></tr>
            </table>
        </div>`;
    });
    html += `</div>`;

    // === COLOR INTERPRETATION ===
    html += `<div class="pfister-report-section">
        <h3><i class="ph ph-book-open"></i> Interpretação das Cores</h3>
        <table class="pfister-color-table pfister-interp-table">
            <thead><tr><th>Cor</th><th>Significado Positivo</th><th>Significado (excessivo/ausente)</th></tr></thead>
            <tbody>`;
    PFISTER_FAMILIES.forEach(f => {
        const interp = COLOR_INTERPRETATIONS[f.key];
        html += `<tr><td><strong>${f.name} (${f.key})</strong></td><td>${interp.pos}</td><td>${interp.neg}</td></tr>`;
    });
    html += `</tbody></table></div>`;

    // Footer
    html += `<div class="pfister-report-footer">
        Manual de referência: VILLEMOR-AMARAL, A. E. <em>As Pirâmides Coloridas de Pfister</em>. São Paulo: Casa do Psicólogo / Pearson, 2005.<br>
        Simulador educacional — não substitui avaliação psicológica oficial.
    </div>`;

    html += `</div>`;

    container.innerHTML = html;
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function pfisterRedo() {
    if (!confirm('Deseja refazer o teste? Os dados atuais serão perdidos.')) return;
    const select = document.getElementById('psico-test-select');
    if (select) select.value = '';
    document.getElementById('psico-test-container').innerHTML = '';
    initPfister();
}

// ==========================================
// HELP POPUPS (EXPLANATIONS & TIPS)
// ==========================================

function showPfisterHelp(topic) {
    let title = '';
    let content = '';

    if (topic === 'cores') {
        title = 'O que é a Análise de Cores?';
        content = `
            <p>Avalia a frequência de cada família de cor escolhida em comparação a uma média normativa esperada para o seu perfil.</p>
            <ul class="pfister-explain-list">
                <li><span class="badge" style="background:rgba(239, 68, 68, 0.1);color:#ef4444">Status ↑ (Elevado)</span> Você usou essa cor muito mais do que a média. Indica intensificação da característica psicológica ligada à cor.</li>
                <li><span class="badge" style="background:rgba(59, 130, 246, 0.1);color:#3b82f6">Status ↓ (Baixo)</span> Você usou menos do que a média. Pode indicar evitação daquela característica ou pouca vivência da mesma.</li>
                <li><span class="badge" style="background:rgba(16, 185, 129, 0.1);color:#10b981">Status = (Adequado)</span> Uso dentro da normalidade estatística. Representa estabilidade e equilíbrio.</li>
            </ul>
            <div class="pfister-dica-box">
                <h4><i class="ph ph-lightbulb"></i> Dicas Práticas</h4>
                <p>Caso tenha o <strong>Vermelho (Vm)</strong> elevado (status ↑), procure meios saudáveis de canalizar sua energia e agressividade, como praticar esportes ou atividades físicas intensas. Se notar ausência total de <strong>Azul (Az)</strong>, é um lembrete para praticar o autocontrole: respire fundo e pense antes de agir (controle a impulsividade).</p>
            </div>
        `;
    } else if (topic === 'sindromes') {
        title = 'O que são as Síndromes Cromáticas?';
        content = `
            <p>As síndromes reúnem grupos de cores para avaliar o seu dinamismo emocional global (como você responde aos estímulos do mundo):</p>
            <ul class="pfister-explain-list">
                <li><strong>Normal (Az+Vm+Vd):</strong> Base do equilíbrio emocional. Valores próximos do esperado indicam boa adaptação e maturidade.</li>
                <li><strong>Estímulo (Vm+Am+La):</strong> Representa sua extroversão, energia vital, sociabilidade e foco no ambiente externo.</li>
                <li><strong>Fria (Az+Vd+Vi):</strong> Representa sua introversão, controle racional, introspecção e respostas mais calculadas.</li>
                <li><strong>Incolor (Pr+Br+Ci):</strong> Pode estar relacionada à inibição emocional, neutralidade ou esvaziamento.</li>
            </ul>
            <div class="pfister-dica-box">
                <h4><i class="ph ph-lightbulb"></i> Dicas Práticas</h4>
                <p>O cenário ideal para um perfil policial é um bom balanço entre a Síndrome Normal e Fria. Se a sua síndrome <strong>Incolor</strong> estiver muito alta, fique atento a sintomas de estresse prolongado, desânimo ou se você está se distanciando emocionalmente das situações.</p>
            </div>
        `;
    } else if (topic === 'formal') {
        title = 'O que é a Análise Formal?';
        content = `
            <p>Enquanto as cores mostram <em>"o que"</em> você sente, a forma (onde você colocou cada cor) revela <em>"como"</em> você pensa. Avalia-se o nível de organização visual, que espelha sua estruturação cognitiva e controle.</p>
            <ul class="pfister-explain-list">
                <li><strong>Estrutura ou Formação Simétrica:</strong> Nível mais elevado de elaboração intelectual. Indica raciocínio lógico forte e equilíbrio emocional.</li>
                <li><strong>Formação em Camada:</strong> Organização boa e sistemática, porém mais voltada para regras e repetição (podendo gerar certa rigidez).</li>
                <li><strong>Tapete:</strong> As cores foram dispostas sem grande preocupação com o padrão simétrico. Pode sugerir um pensamento mais intuitivo ou, caso desorganizado, imaturidade no planejamento de ações.</li>
            </ul>
            <div class="pfister-dica-box">
                <h4><i class="ph ph-lightbulb"></i> Dicas Práticas</h4>
                <p>Para o cargo de perito, a capacidade de organização é vital. Se o seu resultado final foi "Tapete Puro", você pode praticar estruturar melhor seu plano de ação: antes de agir impulsivamente, tente pensar num padrão ou metodologia sistemática para tomar a decisão (simulando a busca pela simetria ou camada).</p>
            </div>
        `;
    }

    const html = `<div class="pfister-explain-overlay" id="pfister-explain-overlay">
        <div class="pfister-explain-modal glass-panel">
            <div class="pfister-explain-header">
                <h3><i class="ph ph-info" style="color:var(--accent-color)"></i> ${title}</h3>
                <button onclick="document.getElementById('pfister-explain-overlay').remove()"><i class="ph ph-x"></i></button>
            </div>
            <div class="pfister-explain-body">${content}</div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', html);
}

// ==========================================
// EVENT BINDING
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('psico-test-select');
    if (select) {
        select.addEventListener('change', (e) => {
            if (e.target.value === 'pfister') initPfister();
        });
    }
});
