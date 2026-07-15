# -*- coding: utf-8 -*-
"""
Gerador v2 do "Material Completo": dirigido por configuração JSON, para
apostilas cuja divisão de capítulos do app NÃO coincide com a do PDF.

Config (JSON):
{
  "pdf": "caminho/apostila.pdf",
  "disc_dir": "materiais/DISC",
  "badge": "Nome da Disciplina",
  "body_size": 11,
  "heading_min_size": 12.5,
  "pausas": ["^Referências$"],
  "files": [
    {"arquivo": "Capitulo_01.html", "titulo": "Capítulo 1 - ...", "gatilho": "^Capítulo 1\\b"},
    ...
  ]
}

Uso: python gen_completo2.py <config.json>
"""
import json
import os
import re
import sys

import fitz

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_completo import (  # noqa: E402
    Montador, spans_para_html, limpa_hifens, esc, eh_lixo, dentro, FIG_RE, TEMPLATE,
)

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

NUM_RE = re.compile(r"^(\d+(?:\.\d+)*)\.?\s+(\S.*)$")


def descompactar_titulo(t):
    """Colapsa títulos tipograficamente espaçados ("P R E M I S S A S")."""
    if len(re.findall(r"\b[A-ZÀ-Ú]\b", t)) < 4:
        return t
    partes = re.split(r"\s{2,}", t.strip())
    return " ".join(
        p.replace(" ", "") if re.fullmatch(r"(?:[A-ZÀ-Ú]\s?)+", p) else p
        for p in partes
    )


def nivel_por_numero(numero):
    profundidade = numero.count(".")
    if profundidade == 0:
        return 2
    if profundidade == 1:
        return 2
    if profundidade == 2:
        return 3
    return 4


def processar(cfg):
    doc = fitz.open(cfg["pdf"])
    out_dir = os.path.join(cfg["disc_dir"], "COMPLETO")
    img_dir = os.path.join(out_dir, "img")
    os.makedirs(img_dir, exist_ok=True)

    body_size = cfg.get("body_size", 11)
    hmin = cfg.get("heading_min_size", 12.5)
    pausas = [re.compile(p) for p in cfg.get("pausas", [])]
    files = cfg["files"]
    gatilhos = [re.compile(f["gatilho"]) for f in files]

    montadores = [Montador() for _ in files]
    atual = -1              # índice do arquivo em captura (-1 = nenhum)
    prox = 0                # próximo gatilho a procurar
    ultimo_heading = None   # (montador, tamanho) p/ continuação de título quebrado
    img_hashes = {}
    img_seq = 0
    onde_disparou = {}

    for pno in range(len(doc)):
        page = doc[pno]

        tabelas = []
        try:
            for tb in page.find_tables().tables:
                dados = tb.extract()
                dados = [[(c or "").replace("\n", " ").strip() for c in row] for row in dados]
                dados = [row for row in dados if any(row)]
                if dados and len(dados) >= 2:
                    tabelas.append({"bbox": tb.bbox, "dados": dados, "emitida": False})
        except Exception:
            pass

        d = page.get_text("dict")
        blocos = sorted(d["blocks"], key=lambda b: (round(b["bbox"][1]), b["bbox"][0]))

        # margem esquerda da página (moda do x das linhas longas de corpo):
        # linhas que começam recuadas em relação a ela iniciam novo parágrafo
        from collections import Counter as _Counter
        xs = _Counter()
        for _bl in blocos:
            if _bl["type"] != 0:
                continue
            for _ln in _bl["lines"]:
                _t = "".join(s["text"] for s in _ln["spans"]).strip()
                if len(_t) > 45:
                    xs[round(_ln["bbox"][0])] += 1
        margem_pag = xs.most_common(1)[0][0] if xs else None

        for bl in blocos:
            for tb in tabelas:
                if not tb["emitida"] and bl["bbox"][1] >= tb["bbox"][1] - 2:
                    if atual >= 0:
                        montadores[atual].tabela(tb["dados"])
                    tb["emitida"] = True

            if bl["type"] == 1:  # imagem
                if atual < 0:
                    continue
                w = bl["bbox"][2] - bl["bbox"][0]
                h = bl["bbox"][3] - bl["bbox"][1]
                if w < 60 or h < 45:
                    continue
                dados_img = bl.get("image")
                if not dados_img:
                    continue
                import hashlib
                md5 = hashlib.md5(dados_img).hexdigest()
                if md5 in img_hashes:
                    continue
                ext = bl.get("ext", "png")
                img_seq += 1
                nome = f"p{pno+1:03d}_{img_seq}.{ext}"
                with open(os.path.join(img_dir, nome), "wb") as f:
                    f.write(dados_img)
                img_hashes[md5] = nome
                montadores[atual].imagem(f"img/{nome}")
                ultimo_heading = None
                continue

            em_tabela = any(dentro(bl["bbox"], tb["bbox"]) for tb in tabelas)
            if em_tabela:
                continue

            for ln in bl["lines"]:
                spans = [s for s in ln["spans"] if s["text"].strip()]
                if not spans:
                    continue
                txt = "".join(s["text"] for s in spans).strip()
                if eh_lixo(txt) or "�" in txt:
                    continue
                size = round(spans[0].get("size", 0), 1)
                todos_bold = all("Bold" in s.get("font", "") for s in spans)

                # 1) gatilho do próximo arquivo?
                if prox < len(files) and (todos_bold or size >= hmin) and gatilhos[prox].search(txt):
                    atual = prox
                    prox += 1
                    onde_disparou[files[atual]["arquivo"]] = pno + 1
                    m = NUM_RE.match(txt)
                    if m:
                        montadores[atual].titulo(2, m.group(1), descompactar_titulo(m.group(2)))
                    else:
                        montadores[atual].titulo(2, "", descompactar_titulo(txt))
                    ultimo_heading = (montadores[atual], size)
                    continue

                # 2) pausa (Referências etc.)
                if atual >= 0 and todos_bold and size >= hmin - 1 and any(p.search(txt) for p in pausas):
                    atual = -1
                    ultimo_heading = None
                    continue

                if atual < 0:
                    continue
                mont = montadores[atual]

                # 3) continuação de título quebrado em duas linhas
                if (ultimo_heading and todos_bold and abs(size - ultimo_heading[1]) <= 0.5
                        and not NUM_RE.match(txt) and len(txt) < 70):
                    tipo, payload = mont.el[-1]
                    if tipo.startswith("h"):
                        numero, texto, anchor = payload
                        mont.el[-1] = (tipo, (numero, texto + " " + txt, anchor))
                        continue

                ultimo_heading = None

                # 4) títulos internos
                m = NUM_RE.match(txt)
                if m and todos_bold and size >= body_size + 0.5:
                    nivel = nivel_por_numero(m.group(1))
                    mont.titulo(nivel, m.group(1), descompactar_titulo(m.group(2)))
                    ultimo_heading = (mont, size)
                elif todos_bold and size >= hmin and len(txt) < 70 and not txt.endswith(('.', ':', ';')):
                    mont.titulo(3, "", txt)
                    ultimo_heading = (mont, size)
                elif (todos_bold and len(txt) < 60 and not txt.endswith(('.', ':', ';', ','))
                      and not txt[:1].islower() and not re.search(r"\d{4}", txt)):
                    mont.titulo(4, "", txt)
                    ultimo_heading = (mont, size)
                elif FIG_RE.match(txt):
                    mont.caption(txt)
                elif "Courier" in spans[0].get("font", "") or "Mono" in spans[0].get("font", ""):
                    mont.linha_mono(txt)
                elif txt.lstrip().startswith(("•", "–", "*")):
                    mont.bullet(txt, spans_para_html(spans))
                elif mont.lista and txt[:1].islower():
                    mont.bullet_cont(spans_para_html(spans))
                else:
                    # recuo de primeira linha => começa parágrafo novo
                    if margem_pag is not None and round(ln["bbox"][0]) - margem_pag > 6:
                        mont.fecha_paragrafo()
                    mont.linha_corpo(txt, spans_para_html(spans))

        for tb in tabelas:
            if not tb["emitida"] and atual >= 0:
                montadores[atual].tabela(tb["dados"])
                tb["emitida"] = True

    # relatório e emissão
    faltaram = [f["arquivo"] for f in files if f["arquivo"] not in onde_disparou]
    if faltaram:
        print("ERRO: gatilhos que não dispararam:", ", ".join(faltaram))
        sys.exit(2)

    for i, f in enumerate(files):
        mont = montadores[i]
        mont.fecha_tudo()
        html_final = TEMPLATE.format(
            titulo_pagina=f"{f['titulo']} (Completo) - {cfg['badge']}",
            badge=esc(cfg["badge"]),
            titulo=esc(f["titulo"]),
            toc=mont.toc(),
            conteudo=mont.render(),
        )
        destino = os.path.join(out_dir, f["arquivo"])
        with open(destino, "w", encoding="utf-8") as fh:
            fh.write(html_final)
        kb = os.path.getsize(destino) // 1024
        print(f"OK: {f['arquivo']} (p.{onde_disparou[f['arquivo']]}, {kb} KB, {len(mont.el)} elementos)")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    with open(sys.argv[1], encoding="utf-8") as f:
        cfg = json.load(f)
    processar(cfg)
