# -*- coding: utf-8 -*-
"""
Gera a versão COMPLETA (texto integral estruturado) dos capítulos de uma
apostila PDF, no mesmo template visual dos materiais resumidos do app.

Saída: materiais/<DISC>/COMPLETO/Capitulo_XX.html (+ COMPLETO/img/*)

Uso:
  python gen_completo.py <apostila.pdf> <dir_disciplina> <badge> "Título 1" "Título 2" ...
Exemplo:
  python gen_completo.py "..\\INFORMATICA FORENSE\\Informática Forense.pdf" \
      materiais/INFORMATICA_FORENSE "Informática Forense" "Introdução" ...
"""
import hashlib
import html as htmlmod
import os
import re
import sys

import fitz

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

SKIP_PATTERNS = [
    re.compile(r"^DOCUMENTO DE ACESSO RESTRITO", re.I),
    re.compile(r"^Portaria n[ºo°]?\s*8\.?714", re.I),
    re.compile(r"^\d{1,3}$"),                      # número de página isolado
    re.compile(r"^Academia Nacional de Pol", re.I),  # cabeçalho corrido (se houver)
]

CAP_RE = re.compile(r"^(\d)\s+([A-ZÀ-Ú].{2,})$")          # 1 INTRODUÇÃO
H2_RE = re.compile(r"^(\d+\.\d+)\s+(\S.*)$")               # 1.1 Título
H3_RE = re.compile(r"^(\d+\.\d+\.\d+)\s+(\S.*)$")          # 1.2.1 Título
H4_RE = re.compile(r"^(\d+\.\d+\.\d+\.\d+)\s+(\S.*)$")     # 7.3.2.1 Título
FIG_RE = re.compile(r"^(Figura|Tabela|Quadro)\s+\d+\s*[–\-—]", re.I)


def esc(t):
    return htmlmod.escape(t, quote=False)


def eh_lixo(txt):
    t = txt.strip()
    if not t:
        return True
    return any(p.match(t) for p in SKIP_PATTERNS)


def spans_para_html(spans):
    """Converte spans de uma linha em HTML com <strong>/<em>, unindo estilos iguais."""
    out = []
    for s in spans:
        txt = s["text"]
        if not txt:
            continue
        fonte = s.get("font", "")
        bold = "Bold" in fonte or "Heavy" in fonte or (s.get("flags", 0) & 16)
        ital = "Italic" in fonte or "Oblique" in fonte or (s.get("flags", 0) & 2)
        mono = "Courier" in fonte or "Mono" in fonte
        h = esc(txt)
        if mono:
            h = f"<code>{h}</code>"
        else:
            if bold:
                h = f"<strong>{h}</strong>"
            if ital:
                h = f"<em>{h}</em>"
        out.append(h)
    joined = "".join(out)
    # funde tags adjacentes iguais
    joined = joined.replace("</strong><strong>", "").replace("</em><em>", "").replace("</code><code>", "")
    return joined


def limpa_hifens(texto):
    texto = texto.replace("­", "")
    return texto


class Montador:
    """Acumula elementos de um capítulo e emite HTML."""

    def __init__(self):
        self.el = []          # lista de tuples (tipo, payload)
        self.par_txt = ""     # parágrafo em construção (texto plano p/ heurísticas)
        self.par_html = ""    # idem, com marcação inline
        self.lista = []       # itens <li> em construção
        self.mono = []        # linhas monoespaçadas em construção
        self.sec_count = 0

    # ---- fechamento de estruturas abertas ----
    def fecha_paragrafo(self):
        if self.par_txt.strip():
            self.el.append(("p", self.par_html.strip()))
        self.par_txt = ""
        self.par_html = ""

    def fecha_lista(self):
        if self.lista:
            self.el.append(("ul", list(self.lista)))
            self.lista = []

    def fecha_mono(self):
        if self.mono:
            self.el.append(("pre", list(self.mono)))
            self.mono = []

    def fecha_tudo(self):
        self.fecha_paragrafo()
        self.fecha_lista()
        self.fecha_mono()

    # ---- entradas ----
    def titulo(self, nivel, numero, texto):
        self.fecha_tudo()
        self.sec_count += 1
        self.el.append((f"h{nivel}", (numero, texto, f"sec{self.sec_count}")))

    def linha_corpo(self, txt, html_linha):
        txt = limpa_hifens(txt)
        html_linha = limpa_hifens(html_linha)
        self.fecha_lista()
        self.fecha_mono()
        if self.par_txt.endswith("-") and txt[:1].islower():
            self.par_txt = self.par_txt[:-1] + txt
            self.par_html = re.sub(r"-(\s*(?:</\w+>)*)$", r"\1", self.par_html) + html_linha
        else:
            sep = " " if self.par_txt else ""
            self.par_txt += sep + txt
            self.par_html += sep + html_linha

    def bullet(self, txt, html_linha):
        self.fecha_paragrafo()
        self.fecha_mono()
        item = limpa_hifens(html_linha).lstrip("•*–- ").strip()
        self.lista.append(item)

    def bullet_cont(self, html_linha):
        if self.lista:
            self.lista[-1] += " " + limpa_hifens(html_linha)

    def linha_mono(self, txt):
        self.fecha_paragrafo()
        self.fecha_lista()
        self.mono.append(esc(txt))

    def caption(self, txt):
        self.fecha_tudo()
        self.el.append(("caption", esc(limpa_hifens(txt))))

    def imagem(self, src):
        self.fecha_tudo()
        self.el.append(("img", src))

    def tabela(self, linhas):
        self.fecha_tudo()
        self.el.append(("table", linhas))

    def quebra_pagina(self):
        # nada por padrão: parágrafos podem continuar na página seguinte
        pass

    # ---- saída ----
    def render(self):
        partes = []
        for tipo, payload in self.el:
            if tipo == "p":
                partes.append(f"<p>{payload}</p>")
            elif tipo in ("h2", "h3", "h4"):
                numero, texto, anchor = payload
                partes.append(f'<{tipo} id="{anchor}">{esc(numero)} {esc(texto)}</{tipo}>')
            elif tipo == "ul":
                lis = "".join(f"<li>{i}</li>" for i in payload)
                partes.append(f"<ul>{lis}</ul>")
            elif tipo == "pre":
                corpo = "\n".join(payload)
                partes.append(f'<pre class="mono">{corpo}</pre>')
            elif tipo == "caption":
                partes.append(f'<p class="fig-caption">{payload}</p>')
            elif tipo == "img":
                partes.append(f'<figure><img src="{payload}" loading="lazy" alt=""></figure>')
            elif tipo == "table":
                linhas_html = []
                for r, linha in enumerate(payload):
                    tag = "th" if r == 0 else "td"
                    tds = "".join(f"<{tag}>{esc(limpa_hifens(c or ''))}</{tag}>" for c in linha)
                    linhas_html.append(f"<tr>{tds}</tr>")
                partes.append("<table>" + "".join(linhas_html) + "</table>")
        return "\n".join(partes)

    def toc(self):
        itens = []
        for tipo, payload in self.el:
            if tipo in ("h2", "h3"):
                numero, texto, anchor = payload
                recuo = ' style="margin-left:16px"' if tipo == "h3" else ""
                itens.append(f'<li{recuo}><a href="#{anchor}">{esc(numero)} {esc(texto)}</a></li>')
        return "\n".join(itens)


TEMPLATE = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{titulo_pagina}</title>
    <link rel="stylesheet" href="../estilo_padrao.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
    <style>
        body {{ font-family: 'Inter', sans-serif; line-height: 1.7; color: #333; background-color: #f9f9f9; padding: 20px; }}
        .container {{ max-width: 100%; margin: auto; background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; margin-bottom: 40px; }}
        .badge {{ display: inline-block; background: #1a202c; color: #fff; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.9em; margin-bottom: 15px; }}
        .badge-full {{ background: #2b6cb0; margin-left: 6px; }}
        h1 {{ font-size: 2.1em; color: #2d3748; margin-bottom: 5px; }}
        .subtitle {{ font-size: 1.1em; color: #718096; }}
        .toc {{ background: #edf2f7; padding: 20px; border-radius: 8px; margin-bottom: 30px; }}
        .toc ul {{ list-style: none; padding: 0; margin: 0; }}
        .toc li {{ margin-bottom: 8px; }}
        .toc a {{ text-decoration: none; color: #3182ce; font-weight: 600; }}
        h2 {{ color: #2b6cb0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 34px; }}
        h3 {{ color: #2d3748; margin-top: 26px; }}
        h4 {{ color: #4a5568; margin-top: 22px; }}
        p {{ margin-bottom: 15px; text-align: justify; }}
        ul, ol {{ margin-bottom: 15px; }}
        li {{ margin-bottom: 6px; }}
        code {{ font-family: 'Consolas', 'Courier New', monospace; background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.92em; }}
        pre.mono {{ font-family: 'Consolas', 'Courier New', monospace; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; overflow-x: auto; font-size: 0.9em; line-height: 1.5; margin: 18px 0; }}
        .fig-caption {{ text-align: center; color: #718096; font-size: 0.92em; font-style: italic; margin-top: -6px; }}
        figure {{ margin: 22px 0; text-align: center; }}
        figure img {{ max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }}
        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.97em; }}
        th, td {{ border: 1px solid #e2e8f0; padding: 10px; text-align: left; vertical-align: top; }}
        th {{ background: #edf2f7; color: #2d3748; }}
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <span class="badge">{badge}</span><span class="badge badge-full">Material Completo</span>
        <h1>{titulo}</h1>
        <div class="subtitle">Texto integral da apostila, estruturado para leitura</div>
    </div>
    <div class="toc">
        <h3>Índice</h3>
        <ul>
{toc}
        </ul>
    </div>
{conteudo}
</div>
<script>
  (function() {{
    var debounceTimer = null;
    function sendHeight() {{
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function() {{
        var container = document.querySelector('.container') || document.body.firstElementChild || document.body;
        var height = container.offsetHeight + 40;
        window.parent.postMessage({{ type: 'resize-iframe', height: height }}, '*');
      }}, 100);
    }}
    window.addEventListener('load', function() {{ setTimeout(sendHeight, 200); }});
    window.addEventListener('resize', sendHeight);
  }})();
</script>
</body>
</html>
"""


def dentro(bbox, área):
    x0, y0, x1, y1 = bbox
    ax0, ay0, ax1, ay1 = área
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    return ax0 - 2 <= cx <= ax1 + 2 and ay0 - 2 <= cy <= ay1 + 2


def processar(pdf_path, disc_dir, badge, titulos):
    doc = fitz.open(pdf_path)
    out_dir = os.path.join(disc_dir, "COMPLETO")
    img_dir = os.path.join(out_dir, "img")
    os.makedirs(img_dir, exist_ok=True)

    capitulos = {}          # num -> Montador
    cap_atual = None
    img_hashes = {}
    img_seq = 0

    for pno in range(len(doc)):
        page = doc[pno]

        # tabelas da página (bboxes para não duplicar o texto)
        tabelas = []
        try:
            for tb in page.find_tables().tables:
                dados = tb.extract()
                dados = [[(c or "").replace("\n", " ").strip() for c in row] for row in dados]
                dados = [row for row in dados if any(row)]
                if dados:
                    tabelas.append({"bbox": tb.bbox, "dados": dados, "emitida": False})
        except Exception:
            pass

        d = page.get_text("dict")
        blocos = sorted(d["blocks"], key=lambda b: (round(b["bbox"][1]), b["bbox"][0]))

        for bl in blocos:
            # tabela cujo topo já passou → emite antes do bloco corrente
            for tb in tabelas:
                if not tb["emitida"] and bl["bbox"][1] >= tb["bbox"][1] - 2:
                    if cap_atual:
                        capitulos[cap_atual].tabela(tb["dados"])
                    tb["emitida"] = True

            if bl["type"] == 1:  # imagem
                if cap_atual is None:
                    continue
                w = bl["bbox"][2] - bl["bbox"][0]
                h = bl["bbox"][3] - bl["bbox"][1]
                if w < 60 or h < 45:
                    continue
                dados = bl.get("image")
                if not dados:
                    continue
                md5 = hashlib.md5(dados).hexdigest()
                if md5 in img_hashes:
                    continue  # logotipos/marcas d'água repetidos
                ext = bl.get("ext", "png")
                img_seq += 1
                nome = f"p{pno+1:03d}_{img_seq}.{ext}"
                with open(os.path.join(img_dir, nome), "wb") as f:
                    f.write(dados)
                img_hashes[md5] = nome
                capitulos[cap_atual].imagem(f"img/{nome}")
                continue

            # bloco de texto
            em_tabela = any(dentro(bl["bbox"], tb["bbox"]) for tb in tabelas)
            if em_tabela:
                continue

            for ln in bl["lines"]:
                spans = [s for s in ln["spans"] if s["text"].strip()]
                if not spans:
                    continue
                txt = "".join(s["text"] for s in spans).strip()
                if eh_lixo(txt):
                    continue
                fonte = spans[0].get("font", "")
                size = round(spans[0].get("size", 0), 1)
                bold = "Bold" in fonte

                m_cap = CAP_RE.match(txt)
                if m_cap and bold and size >= 12.5 and txt.upper() == txt:
                    num = int(m_cap.group(1))
                    if 1 <= num <= len(titulos):
                        cap_atual = num
                        capitulos.setdefault(num, Montador())
                    continue
                if cap_atual is None:
                    continue  # ainda no sumário/capa

                mont = capitulos[cap_atual]
                if H4_RE.match(txt) and bold:
                    m = H4_RE.match(txt)
                    mont.titulo(4, m.group(1), m.group(2))
                elif H3_RE.match(txt) and bold:
                    m = H3_RE.match(txt)
                    mont.titulo(3, m.group(1), m.group(2))
                elif H2_RE.match(txt) and bold and size >= 12.5:
                    m = H2_RE.match(txt)
                    mont.titulo(2, m.group(1), m.group(2))
                elif FIG_RE.match(txt):
                    mont.caption(txt)
                elif "Courier" in fonte or "Mono" in fonte:
                    mont.linha_mono(txt)
                elif txt.lstrip().startswith(("•", "–", "*")):
                    mont.bullet(txt, spans_para_html(spans))
                elif mont.lista and txt[:1].islower():
                    mont.bullet_cont(spans_para_html(spans))
                else:
                    mont.linha_corpo(txt, spans_para_html(spans))

        # tabelas restantes da página
        for tb in tabelas:
            if not tb["emitida"] and cap_atual:
                capitulos[cap_atual].tabela(tb["dados"])
                tb["emitida"] = True

        if cap_atual:
            capitulos[cap_atual].quebra_pagina()

    # emite os arquivos
    for num in sorted(capitulos):
        mont = capitulos[num]
        mont.fecha_tudo()
        titulo = f"Capítulo {num} - {titulos[num-1]}"
        html_final = TEMPLATE.format(
            titulo_pagina=f"{titulo} (Completo) - {badge}",
            badge=esc(badge),
            titulo=esc(titulo),
            toc=mont.toc(),
            conteudo=mont.render(),
        )
        destino = os.path.join(out_dir, f"Capitulo_{num:02d}.html")
        with open(destino, "w", encoding="utf-8") as f:
            f.write(html_final)
        kb = os.path.getsize(destino) // 1024
        print(f"OK: Capitulo_{num:02d}.html ({kb} KB, {len(mont.el)} elementos)")


if __name__ == "__main__":
    if len(sys.argv) < 5:
        print(__doc__)
        sys.exit(1)
    processar(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4:])
