const fs = require('fs');
const path = require('path');

const dir = '../NOVO';
const files = fs.readdirSync(dir);
const htmlFile = files.find(f => f.startsWith('PCF at') && f.endsWith('.html'));
const htmlPath = path.join(dir, htmlFile);

let html = fs.readFileSync(htmlPath, 'utf-8');

const mesNames = {
    "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
    "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
    "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro"
};

const pautaC = {};

const pages = html.split('<div class="print-page">');

for (let i = 1; i < pages.length; i++) {
    const page = pages[i];
    if (!page.includes('PCF - TURMA C')) continue;

    const tableMatch = page.match(/<table[^>]*>([\s\S]*?)<\/table>/);
    if (!tableMatch) continue;
    const tableHtml = tableMatch[1];

    const trsMatch = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g);
    if (!trsMatch) continue;

    const headerTr = trsMatch[0];
    const headerCells = headerTr.match(/<th[^>]*>([\s\S]*?)<\/th>|<td[^>]*>([\s\S]*?)<\/td>/g);
    
    if (!headerCells) continue;

    const dayCols = [];
    for (let j = 1; j < headerCells.length; j++) {
        let cellText = headerCells[j].replace(/<[^>]+>/g, ' ').trim().replace(/\s+/g, ' ');
        
        let match = cellText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (match) {
            let dia = match[1];
            let mes = match[2];
            let ano = match[3];
            let mesAno = mes + '-' + ano;
            let diaSemana = cellText.substring(0, match.index).trim();
            
            diaSemana = diaSemana.replace(/Tera/g, 'Terça').replace(/Sbado/g, 'Sábado');
            
            dayCols.push({
                index: j,
                dia: dia,
                diaSemana: diaSemana,
                mesAno: mesAno,
                mes: mes,
                ano: ano
            });
        }
    }

    for (let r = 1; r < trsMatch.length; r++) {
        let cells = trsMatch[r].match(/<th[^>]*>([\s\S]*?)<\/th>|<td[^>]*>([\s\S]*?)<\/td>/g);
        if (!cells || cells.length === 0) continue;
        
        let horarioCellText = cells[0];
        let horarioMatches = horarioCellText.match(/<div class="time-number[^>]*>([^<]+)<\/div>([\s\S]*?)<div class="time-interval[^>]*>([^<]+)<\/div>/);
        let horario = "";
        if (horarioMatches) {
            horario = horarioMatches[3].trim().replace('-', 'a');
        } else {
            horario = horarioCellText.replace(/<[^>]+>/g, ' ').trim().replace(/\s+/g, ' ').split(' ').slice(-3).join(' ').replace('-', 'a');
        }

        for (let dcol of dayCols) {
            let cellHtml = cells[dcol.index];
            if (!cellHtml) continue;
            
            let mesAno = dcol.mesAno;
            if (!pautaC[mesAno]) pautaC[mesAno] = { mes: dcol.mes, ano: dcol.ano, dias: {} };
            
            let dia = dcol.dia;
            if (!pautaC[mesAno].dias[dia]) {
                pautaC[mesAno].dias[dia] = { dia: dia, diaSemana: dcol.diaSemana, blocos: [] };
            }

            let aulaBlocks = cellHtml.split(/<div class="aula-cell"[^>]*>/);
            aulaBlocks.shift(); // remove everything before the first aula-cell
            
            if (aulaBlocks.length > 0) {
                for (let aulaHtml of aulaBlocks) {
                    let aulaName = "N/A";
                    let subjectMatch = aulaHtml.match(/<span class="subject-name[^>]*>([\s\S]*?)<\/span>/);
                    
                    if (subjectMatch) {
                        let innerHtml = subjectMatch[1];
                        let divMatches = innerHtml.match(/<div[^>]*>([\s\S]*?)<\/div>/g);
                        if (divMatches && divMatches.length >= 2) {
                            let firstDiv = divMatches[0].replace(/<[^>]+>/g, '').trim();
                            let secondDiv = divMatches[1].replace(/<[^>]+>/g, '').trim();
                            
                            if (firstDiv.toLowerCase() === 'eventos') {
                                aulaName = "EVENTO - " + secondDiv;
                            } else {
                                aulaName = secondDiv;
                            }
                        } else {
                            aulaName = innerHtml.replace(/<[^>]+>/g, '').trim();
                            if (aulaName.toLowerCase().startsWith('eventos')) {
                                aulaName = "EVENTO - " + aulaName.substring(7).trim();
                            }
                        }
                    } else {
                        aulaName = aulaHtml.replace(/<[^>]+>/g, ' ').trim();
                    }
                    
                    aulaName = aulaName.replace(/\s+/g, ' ').replace(/Instruo/g, 'Instrução').replace(/Execuo/g, 'Execução').replace(/Criminalstica/g, 'Criminalística').replace(/Custdia/g, 'Custódia').replace(/Sbado/g, 'Sábado').replace(/&\#x[0-9A-Fa-f]+;/g, '');
                    
                    pautaC[mesAno].dias[dia].blocos.push({ horario: horario, aula: aulaName });
                }
            } else {
                let cellText = cellHtml.replace(/<[^>]+>/g, ' ').trim().replace(/\s+/g, ' ');
                if (cellText && cellText !== "") {
                    cellText = cellText.replace(/Instruo/g, 'Instrução').replace(/Execuo/g, 'Execução').replace(/&\#x[0-9A-Fa-f]+;/g, '');
                    pautaC[mesAno].dias[dia].blocos.push({ horario: horario, aula: "EVENTO - " + cellText });
                }
            }
        }
    }
}

const mesesArray = [];
const pautasDict = { "pcf": {} };

let sortedMesAnos = Object.keys(pautaC).sort((a, b) => {
    let [mA, yA] = a.split('-');
    let [mB, yB] = b.split('-');
    if (yA !== yB) return parseInt(yA) - parseInt(yB);
    return parseInt(mA) - parseInt(mB);
});

for (let ma of sortedMesAnos) {
    let data = pautaC[ma];
    mesesArray.push({
        id: ma,
        nome: `${mesNames[data.mes] || data.mes} de ${data.ano}`
    });
    
    let diasList = [];
    let sortedDias = Object.keys(data.dias).sort((a, b) => parseInt(a) - parseInt(b));
    for (let d of sortedDias) {
        diasList.push(data.dias[d]);
    }
    pautasDict.pcf[ma] = diasList;
}

const agendaDados = {
    cargos: [
        { id: "pcf", nome: "Perito Criminal Federal" }
    ],
    meses: mesesArray,
    pautas: pautasDict
};

const jsContent = "// ==========================================\n// BANCO DE DADOS DA AGENDA DO CURSO (PAUTA)\n// ==========================================\n\nconst agendaDados = " + JSON.stringify(agendaDados, null, 4) + ";\n";

fs.writeFileSync('agenda_dados.js', jsContent, 'utf-8');
