# -*- coding: utf-8 -*-
"""Monta o HTML de estudo a partir de achados.json.

Página única, offline, dividida por disciplina (uma aba cada, sem mistura),
com filtro por tipo de ênfase, busca e modo "só os decisivos".
Uso: python _reform/decorebas/montar_html.py
"""
import json, re, sys, html
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
AQUI = Path(__file__).parent
DADOS = json.loads((AQUI / 'achados.json').read_text(encoding='utf-8'))
SAIDA = AQUI.parents[1] / 'materiais' / 'PEGADINHAS_5_MATERIAS.html'

GRUPOS = [
    ('absoluto',     'Absolutos',    'Palavras que fecham a regra: sempre, nunca, somente, exclusivamente, todos, nenhum, obrigatório, vedado.'),
    ('preferencia',  'Preferência',  'Grau mais fraco: preferencialmente, desejável, recomenda-se, ideal, sempre que possível.'),
    ('regra_excecao','Regra/Exceção','O que vale “em regra” e o que é exceção: geralmente, normalmente, salvo, exceto.'),
    ('proibicao',    'Proibições',   'Deveres estritos: não deve, não pode, é vedado, sob pena de, é facultado.'),
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
    """Destaca os termos de ênfase dentro da frase (o resto vai escapado)."""
    out, pos = [], 0
    for m in TERMO_RE.finditer(texto):
        out.append(html.escape(texto[pos:m.start()]))
        out.append(f'<mark>{html.escape(m.group(0))}</mark>')
        pos = m.end()
    out.append(html.escape(texto[pos:]))
    return ''.join(out)


def slug(s):
    s = re.sub(r'[^a-z0-9]+', '-', s.lower())
    return s.strip('-')


discs = []
for d in DADOS:
    tot = sum(len(c['achados']) for c in d['capitulos'])
    fortes = sum(1 for c in d['capitulos'] for a in c['achados'] if a['forte'])
    discs.append({**d, 'total': tot, 'fortes': fortes, 'id': slug(d['pasta'])})

total_geral = sum(x['total'] for x in discs)
total_fortes = sum(x['fortes'] for x in discs)

abas = '\n'.join(
    f'<button class="aba{" ativa" if i == 0 else ""}" data-alvo="{x["id"]}">'
    f'{html.escape(x["disciplina"].split("—")[0].strip())}'
    f'<span class="cnt">{x["total"]}</span></button>'
    for i, x in enumerate(discs))

secoes = []
for i, d in enumerate(discs):
    caps = []
    for c in d['capitulos']:
        itens = []
        for a in c['achados']:
            cls = COR.get(a['grupo'], '')
            forte = ' forte' if a['forte'] else ''
            sec = f'<span class="sec">{html.escape(a["secao"])}</span>' if a['secao'] else ''
            itens.append(
                f'<li class="item {cls}{forte}" data-g="{a["grupo"]}" data-f="{int(a["forte"])}">'
                f'{sec}<p>{marcar(a["texto"])}</p></li>')
        caps.append(
            f'<details class="cap" open><summary>{html.escape(c["titulo"])}'
            f'<span class="cnt">{len(c["achados"])}</span></summary>'
            f'<ul class="itens">{"".join(itens)}</ul></details>')
    secoes.append(
        f'<section class="disc{" ativa" if i == 0 else ""}" id="{d["id"]}">'
        f'<h2>{html.escape(d["disciplina"])}</h2>'
        f'<p class="resumo">{d["total"]} trechos · {d["fortes"]} com termo decisivo · '
        f'{len(d["capitulos"])} capítulos</p>'
        f'{"".join(caps)}</section>')

legenda = '\n'.join(
    f'<label class="chip {COR[g]}"><input type="checkbox" data-g="{g}" checked> '
    f'<b>{nome}</b><span>{desc}</span></label>' for g, nome, desc in GRUPOS)

HTML = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pegadinhas de ênfase — 5 matérias da prova</title>
<style>
  :root {{
    --bg:#f6f7f9; --card:#fff; --texto:#1f2430; --suave:#667085; --linha:#e4e7ec;
    --abs:#c0392b; --pref:#b7791f; --regra:#2b6cb0; --proib:#6b46c1;
  }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; background:var(--bg); color:var(--texto);
    font:16px/1.65 'Inter',system-ui,-apple-system,Segoe UI,sans-serif; }}
  header {{ background:#141a24; color:#fff; padding:26px 20px 20px; }}
  .wrap {{ max-width:1000px; margin:0 auto; padding:0 20px; }}
  header h1 {{ margin:0 0 6px; font-size:1.5rem; }}
  header p {{ margin:0; color:#aab3c0; font-size:.92rem; }}
  .barra {{ position:sticky; top:0; z-index:5; background:#fff; border-bottom:1px solid var(--linha);
    padding:10px 0; box-shadow:0 1px 6px rgba(0,0,0,.05); }}
  .abas {{ display:flex; gap:6px; flex-wrap:wrap; }}
  .aba {{ border:1px solid var(--linha); background:#fff; color:var(--suave); cursor:pointer;
    padding:7px 13px; border-radius:999px; font-size:.86rem; font-weight:600; }}
  .aba.ativa {{ background:#141a24; color:#fff; border-color:#141a24; }}
  .aba .cnt {{ margin-left:6px; opacity:.65; font-weight:500; }}
  .ferramentas {{ display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-top:10px; }}
  #busca {{ flex:1; min-width:220px; padding:8px 12px; border:1px solid var(--linha);
    border-radius:8px; font-size:.9rem; }}
  .chips {{ display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }}
  .chip {{ display:flex; align-items:center; gap:7px; border:1px solid var(--linha);
    border-radius:8px; padding:6px 10px; background:#fff; font-size:.8rem; cursor:pointer; }}
  .chip b {{ font-size:.82rem; }}
  .chip span {{ color:var(--suave); display:none; }}
  .chip.abs b {{ color:var(--abs); }} .chip.pref b {{ color:var(--pref); }}
  .chip.regra b {{ color:var(--regra); }} .chip.proib b {{ color:var(--proib); }}
  .so-fortes {{ margin-left:auto; font-size:.84rem; color:var(--suave);
    display:flex; align-items:center; gap:7px; }}
  main {{ padding:22px 0 60px; }}
  .disc {{ display:none; }} .disc.ativa {{ display:block; }}
  .disc h2 {{ font-size:1.28rem; margin:6px 0 2px; }}
  .resumo {{ color:var(--suave); font-size:.86rem; margin:0 0 18px; }}
  .cap {{ background:var(--card); border:1px solid var(--linha); border-radius:10px;
    margin-bottom:12px; overflow:hidden; }}
  .cap summary {{ cursor:pointer; padding:12px 16px; font-weight:700; font-size:.97rem;
    display:flex; justify-content:space-between; gap:10px; }}
  .cap summary::marker {{ color:var(--suave); }}
  .cap .cnt {{ color:var(--suave); font-weight:500; font-size:.85rem; }}
  .itens {{ list-style:none; margin:0; padding:0 16px 8px; }}
  .item {{ border-left:3px solid var(--linha); padding:9px 0 9px 13px; margin-bottom:9px; }}
  .item.abs {{ border-color:var(--abs); }} .item.pref {{ border-color:var(--pref); }}
  .item.regra {{ border-color:var(--regra); }} .item.proib {{ border-color:var(--proib); }}
  .item p {{ margin:0; font-size:.94rem; }}
  .item .sec {{ display:block; font-size:.73rem; text-transform:uppercase;
    letter-spacing:.03em; color:var(--suave); margin-bottom:3px; }}
  .item.forte {{ background:#fffdf3; }}
  mark {{ background:#ffe9a8; padding:0 2px; border-radius:3px; font-weight:600; }}
  .vazio {{ color:var(--suave); font-size:.9rem; padding:20px 0; }}
  @media print {{
    .barra, header p {{ display:none; }}
    .disc {{ display:block !important; page-break-before:always; }}
    .cap {{ break-inside:avoid; }}
  }}
</style>
</head>
<body>
<header>
  <div class="wrap">
    <h1>Pegadinhas de ênfase — 5 matérias</h1>
    <p>{total_geral} trechos do material completo em que a apostila usa palavras que
       mudam o gabarito ({total_fortes} com termo decisivo). Cada matéria em sua própria aba.</p>
  </div>
</header>

<div class="barra">
  <div class="wrap">
    <div class="abas">{abas}</div>
    <div class="ferramentas">
      <input id="busca" type="search" placeholder="Buscar palavra ou trecho nesta matéria…">
      <label class="so-fortes"><input type="checkbox" id="fortes"> só os decisivos</label>
    </div>
    <div class="chips">{legenda}</div>
  </div>
</div>

<main class="wrap">
{''.join(secoes)}
<p class="vazio" id="vazio" hidden>Nenhum trecho com esses filtros.</p>
</main>

<script>
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  $$('.aba').forEach(b => b.onclick = () => {{
    $$('.aba').forEach(x => x.classList.toggle('ativa', x === b));
    $$('.disc').forEach(s => s.classList.toggle('ativa', s.id === b.dataset.alvo));
    aplicar();
  }});

  function aplicar() {{
    const termo = document.getElementById('busca').value.trim().toLowerCase();
    const soFortes = document.getElementById('fortes').checked;
    const ligados = new Set($$('.chip input:checked').map(i => i.dataset.g));
    const disc = document.querySelector('.disc.ativa');
    if (!disc) return;
    let visiveis = 0;
    $$('.item', disc).forEach(li => {{
      const ok = ligados.has(li.dataset.g)
        && (!soFortes || li.dataset.f === '1')
        && (!termo || li.textContent.toLowerCase().includes(termo));
      li.hidden = !ok;
      if (ok) visiveis++;
    }});
    // Capítulo sem nenhum item visível some junto.
    $$('.cap', disc).forEach(c => {{
      const n = $$('.item', c).filter(i => !i.hidden).length;
      c.hidden = n === 0;
      c.querySelector('.cnt').textContent = n;
    }});
    document.getElementById('vazio').hidden = visiveis > 0;
  }}

  document.getElementById('busca').addEventListener('input', aplicar);
  document.getElementById('fortes').addEventListener('change', aplicar);
  $$('.chip input').forEach(i => i.addEventListener('change', aplicar));
  aplicar();
</script>
</body>
</html>
"""

SAIDA.write_text(HTML, encoding='utf-8')
print(f'Gerado: {SAIDA}')
print(f'  {total_geral} trechos ({total_fortes} decisivos) em {len(discs)} disciplinas')
for d in discs:
    print(f'  - {d["disciplina"]:<42}{d["total"]:>5} trechos, {len(d["capitulos"])} caps')
