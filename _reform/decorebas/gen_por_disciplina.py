# -*- coding: utf-8 -*-
"""Gera um HTML de "Pegadinhas" POR DISCIPLINA, no padrão visual dos materiais,
para entrar na aba Materiais como um capítulo a mais.

Grava em materiais/<PASTA>/HTML/Pegadinhas.html e também em COMPLETO/, porque o
app monta a URL com a pasta da versão ativa (resumido ou completo).
Uso: python _reform/decorebas/gen_por_disciplina.py
"""
import json, re, sys, html
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
AQUI = Path(__file__).parent
RAIZ = AQUI.parents[1]
DADOS = json.loads((AQUI / 'achados.json').read_text(encoding='utf-8'))

GRUPOS = [
    ('absoluto',      'Absolutos',     'sempre, nunca, somente, exclusivamente, todos, nenhum, obrigatório, vedado'),
    ('preferencia',   'Preferência',   'preferencialmente, desejável, recomenda-se, ideal, sempre que possível'),
    ('regra_excecao', 'Regra/Exceção', 'geralmente, normalmente, em regra, salvo, exceto'),
    ('proibicao',     'Proibições',    'não deve, não pode, é vedado, sob pena de, é facultado'),
]
COR = {'absoluto': 'abs', 'preferencia': 'pref', 'regra_excecao': 'regra', 'proibicao': 'proib'}

TERMO_RE = re.compile(
    r'\b(sempre que poss[íi]vel|em hip[óo]tese alguma|de prefer[êe]ncia|via de regra|em regra|'
    r'de modo geral|em geral|na maioria d\w+|a menos que|sob pena de|deixar de|'
    r'n[ãa]o\s+(?:se\s+)?dev\w+|n[ãa]o\s+(?:se\s+)?pod\w+|n[ãa]o\s+[ée]\s+\w+|'
    r'sempre|nunca|jamais|necessariamente|obrigat[óo]ri\w*|imprescind[íi]vel\w*|indispens[áa]vel\w*|'
    r'exclusivamente|unicamente|somente|apenas|vedad\w+|proibid\w+|invariavelmente|incondicional\w*|'
    r'todos os|todas as|qualquer|nenhum[ao]?|'
    r'preferencialmente|prefer[íi]vel|prioritariamente|desej[áa]vel|recomenda-se|recomend[áa]vel|'
    r'recomendad\w+|aconselh[áa]vel|aconselha-se|sugere-se|sugerid\w+|ideal(?:mente)?|'
    r'quando poss[íi]vel|se poss[íi]vel|evitar|evite|procure|'
    r'geralmente|normalmente|comumente|salvo|exceto|ressalvad\w+|exce[çc][ãa]o|excepcionalmente|'
    r'[ée]\s+facultad\w+|faculta-se)\b', re.I)


def marcar(texto):
    out, pos = [], 0
    for m in TERMO_RE.finditer(texto):
        out.append(html.escape(texto[pos:m.start()]))
        out.append(f'<mark>{html.escape(m.group(0))}</mark>')
        pos = m.end()
    out.append(html.escape(texto[pos:]))
    return ''.join(out)


CSS = """
body { font-family:'Inter',system-ui,-apple-system,Segoe UI,sans-serif; line-height:1.7;
  color:#333; background:#f9f9f9; padding:20px; }
.container { max-width:100%; margin:auto; background:#fff; padding:40px; border-radius:8px;
  box-shadow:0 4px 10px rgba(0,0,0,.1); }
.header { text-align:center; margin-bottom:26px; }
.badge { display:inline-block; background:#1a202c; color:#fff; padding:5px 15px;
  border-radius:20px; font-weight:bold; font-size:.9em; margin-bottom:15px; }
.badge-peg { background:#c0392b; margin-left:6px; }
h1 { font-size:2.1em; color:#2d3748; margin-bottom:5px; }
.subtitle { font-size:1.05em; color:#718096; }
.como { background:#fffbea; border:1px solid #f6e05e; border-left:4px solid #d69e2e;
  border-radius:8px; padding:14px 18px; margin:22px 0; font-size:.95em; color:#5f4b1f; }
.como b { color:#7b5c10; }
.ferramentas { display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin:18px 0 8px; }
#busca { flex:1; min-width:220px; padding:9px 12px; border:1px solid #e2e8f0;
  border-radius:8px; font-size:.95em; }
.so-fortes { font-size:.9em; color:#4a5568; display:flex; align-items:center; gap:7px;
  white-space:nowrap; }
.chips { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:22px; }
.chip { display:flex; align-items:center; gap:7px; border:1px solid #e2e8f0; border-radius:8px;
  padding:6px 11px; background:#fff; font-size:.85em; cursor:pointer; }
.chip b { font-size:.9em; } .chip span { color:#718096; font-size:.85em; }
.chip.abs b{color:#c0392b;} .chip.pref b{color:#b7791f;}
.chip.regra b{color:#2b6cb0;} .chip.proib b{color:#6b46c1;}
.cap { border:1px solid #e2e8f0; border-radius:10px; margin-bottom:14px; overflow:hidden; }
.cap summary { cursor:pointer; padding:13px 16px; font-weight:700; background:#edf2f7;
  color:#2d3748; display:flex; justify-content:space-between; gap:10px; }
.cap .cnt { color:#718096; font-weight:500; font-size:.9em; }
.itens { list-style:none; margin:0; padding:12px 16px; }
.item { border-left:3px solid #e2e8f0; padding:9px 0 9px 14px; margin-bottom:10px; }
.item.abs{border-color:#c0392b;} .item.pref{border-color:#b7791f;}
.item.regra{border-color:#2b6cb0;} .item.proib{border-color:#6b46c1;}
.item p { margin:0; font-size:1em; text-align:left; }
.item .sec { display:block; font-size:.75em; text-transform:uppercase; letter-spacing:.03em;
  color:#718096; margin-bottom:4px; }
.item.forte { background:#fffdf3; }
mark { background:#ffe9a8; padding:0 2px; border-radius:3px; font-weight:600; }
.vazio { color:#718096; padding:18px 0; }
"""

JS = """
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
function aplicar() {
  const termo = document.getElementById('busca').value.trim().toLowerCase();
  const soFortes = document.getElementById('fortes').checked;
  const ligados = new Set($$('.chip input:checked').map(i => i.dataset.g));
  let visiveis = 0;
  $$('.item').forEach(li => {
    const ok = ligados.has(li.dataset.g)
      && (!soFortes || li.dataset.f === '1')
      && (!termo || li.textContent.toLowerCase().includes(termo));
    li.hidden = !ok;
    if (ok) visiveis++;
  });
  $$('.cap').forEach(c => {
    const n = $$('.item', c).filter(i => !i.hidden).length;
    c.hidden = n === 0;
    c.querySelector('.cnt').textContent = n;
  });
  document.getElementById('vazio').hidden = visiveis > 0;
  // O app mede a altura do iframe; avisa que o conteúdo mudou.
  window.dispatchEvent(new Event('resize'));
}
document.getElementById('busca').addEventListener('input', aplicar);
document.getElementById('fortes').addEventListener('change', aplicar);
$$('.chip input').forEach(i => i.addEventListener('change', aplicar));
aplicar();
"""


def gerar(d):
    total = sum(len(c['achados']) for c in d['capitulos'])
    fortes = sum(1 for c in d['capitulos'] for a in c['achados'] if a['forte'])

    caps = []
    for c in d['capitulos']:
        itens = []
        for a in c['achados']:
            sec = f'<span class="sec">{html.escape(a["secao"])}</span>' if a['secao'] else ''
            itens.append(
                f'<li class="item {COR[a["grupo"]]}{" forte" if a["forte"] else ""}" '
                f'data-g="{a["grupo"]}" data-f="{int(a["forte"])}">'
                f'{sec}<p>{marcar(a["texto"])}</p></li>')
        caps.append(
            f'<details class="cap" open><summary>{html.escape(c["titulo"])}'
            f'<span class="cnt">{len(c["achados"])}</span></summary>'
            f'<ul class="itens">{"".join(itens)}</ul></details>')

    chips = '\n'.join(
        f'<label class="chip {COR[g]}"><input type="checkbox" data-g="{g}" checked>'
        f'<b>{nome}</b> <span>{desc}</span></label>' for g, nome, desc in GRUPOS)

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pegadinhas de ênfase - {html.escape(d['disciplina'])}</title>
<link rel="stylesheet" href="../estilo_padrao.css">
<style>{CSS}</style>
</head>
<body>
<div class="container">
  <div class="header">
    <span class="badge">{html.escape(d['disciplina'])}</span><span class="badge badge-peg">Pegadinhas</span>
    <h1>Pegadinhas de ênfase</h1>
    <div class="subtitle">Trechos da apostila com palavras que mudam o gabarito</div>
  </div>

  <div class="como">
    <b>Como usar:</b> são {total} trechos desta matéria em que o texto usa palavras como
    <i>sempre, nunca, somente, preferencialmente, desejável, em regra</i> — o tipo de detalhe
    que a banca troca para inverter a resposta. Marque <b>“só os decisivos”</b> para ver os
    {fortes} mais cobrados. A palavra que muda o sentido está destacada em amarelo.
  </div>

  <div class="ferramentas">
    <input id="busca" type="search" placeholder="Buscar palavra ou trecho…">
    <label class="so-fortes"><input type="checkbox" id="fortes"> só os decisivos ({fortes})</label>
  </div>
  <div class="chips">{chips}</div>

  {''.join(caps)}
  <p class="vazio" id="vazio" hidden>Nenhum trecho com esses filtros.</p>
</div>
<script>{JS}</script>
</body>
</html>
"""


for d in DADOS:
    conteudo = gerar(d)
    for sub in ('HTML', 'COMPLETO'):
        destino = RAIZ / 'materiais' / d['pasta'] / sub
        if not destino.is_dir():
            print(f'  ! pasta inexistente, pulando: {destino}')
            continue
        (destino / 'Pegadinhas.html').write_text(conteudo, encoding='utf-8')
    n = sum(len(c['achados']) for c in d['capitulos'])
    print(f'{d["disciplina"]:<42} {n:>4} trechos -> {d["pasta"]}/[HTML,COMPLETO]/Pegadinhas.html')
