# coding: utf-8
import bs4
import io
import glob
import json
import re

html_file = glob.glob('../NOVO/PCF at*.html')[0]
with io.open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
    soup = bs4.BeautifulSoup(f, 'html.parser')

mes_names = {
    "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
    "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
    "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro"
}

pauta_c = {}

for page in soup.find_all('div', class_='print-page'):
    subtitle = page.find('h2', class_='print-subtitle')
    if not subtitle or 'PCF - TURMA C' not in subtitle.get_text():
        continue

    table = page.find('table')
    if not table:
        continue
    
    trs = table.find_all('tr')
    headers = trs[0].find_all(['th', 'td'])
    
    day_cols = []
    for i, h in enumerate(headers):
        if i == 0: continue
        text = h.get_text(separator=' ', strip=True)
        match = re.search(r'(\d{2})/(\d{2})/(\d{4})', text)
        if match:
            dia = match.group(1)
            mesAno = match.group(2) + '-' + match.group(3)
            diaSemana = text[:match.start()].strip()
            
            # manual cleanups
            diaSemana = diaSemana.replace('Tera', 'Terça').replace('Sbado', 'Sábado').replace('Tera', 'Terça').replace('Sbado', 'Sábado')
            
            day_cols.append({
                'index': i,
                'dia': dia,
                'diaSemana': diaSemana,
                'mesAno': mesAno,
                'mes': match.group(2),
                'ano': match.group(3)
            })

    for tr in trs[1:]:
        tds = tr.find_all(['th', 'td'])
        if not tds: continue
        horario = tds[0].get_text(separator=' ', strip=True)
        
        time_divs = tds[0].find_all('div')
        if len(time_divs) >= 2:
            horario = time_divs[1].get_text(strip=True).replace('-', 'a')
        else:
            horario = horario.split(' ', 1)[-1].replace('-', 'a')
            
        for dcol in day_cols:
            idx = dcol['index']
            if idx < len(tds):
                cell = tds[idx]
                aula_cells = cell.find_all('div', class_='aula-cell')
                
                mesAno = dcol['mesAno']
                if mesAno not in pauta_c:
                    pauta_c[mesAno] = {'mes': dcol['mes'], 'ano': dcol['ano'], 'dias': {}}
                
                dia = dcol['dia']
                if dia not in pauta_c[mesAno]['dias']:
                    pauta_c[mesAno]['dias'][dia] = {
                        'dia': dia,
                        'diaSemana': dcol['diaSemana'],
                        'blocos': []
                    }
                
                if aula_cells:
                    for ac in aula_cells:
                        subject = ac.find('div', class_='cell-subject')
                        topic = ac.find('div', class_='cell-topic')
                        
                        aula_name = "N/A"
                        if subject:
                            # We just want the acronym which is usually in topic or subject.
                            # In existing agenda: "CRI M1.01 (1P)" which is inside topic!
                            if topic:
                                aula_name = topic.find('span', class_='topic-name').get_text(strip=True) if topic.find('span', class_='topic-name') else topic.get_text(strip=True)
                            else:
                                aula_name = subject.find('span', class_='subject-name').get_text(strip=True) if subject.find('span', class_='subject-name') else subject.get_text(strip=True)
                        else:
                            aula_name = ac.get_text(strip=True)
                            
                        # Clean unicode artifacts
                        aula_name = aula_name.replace('', 'ç').replace('', 'ã').replace('', 'í') # Not reliable, better to leave or remove if completely garbled
                        pauta_c[mesAno]['dias'][dia]['blocos'].append({
                            'horario': horario,
                            'aula': aula_name
                        })
                else:
                    event = cell.get_text(strip=True)
                    if event and event != "":
                        pauta_c[mesAno]['dias'][dia]['blocos'].append({
                            'horario': horario,
                            'aula': "EVENTO - " + event
                        })

# Now format back to agenda_dados.js JS syntax
meses_array = []
for ma, data in pauta_c.items():
    meses_array.append({
        'id': ma,
        'nome': f"{mes_names.get(data['mes'], data['mes'])} de {data['ano']}"
    })

pautas_dict = {"pcf": {}}
for ma, data in pauta_c.items():
    dias_list = []
    # sort by day number
    for d in sorted(data['dias'].keys(), key=lambda x: int(x)):
        dias_list.append(data['dias'][d])
    pautas_dict['pcf'][ma] = dias_list

agenda_dados = {
    "cargos": [
        {
            "id": "pcf",
            "nome": "Perito Criminal Federal"
        }
    ],
    "meses": meses_array,
    "pautas": pautas_dict
}

js_content = "// ==========================================\n// BANCO DE DADOS DA AGENDA DO CURSO (PAUTA)\n// ==========================================\n\nconst agendaDados = " + json.dumps(agenda_dados, ensure_ascii=False, indent=4) + ";\n"

with io.open('agenda_dados.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
