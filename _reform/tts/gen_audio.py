# -*- coding: utf-8 -*-
"""
Gera áudio neural (edge-tts) para capítulos de material do app.
Extrai o texto do HTML com as MESMAS regras do leitor tts_material.js:
pula índice, remove refs de página, lineariza tabelas, expande Art./§/nº.

Uso:
  python gen_audio.py <caminho_capitulo.html> <voz> <saida.mp3> [--marks saida.json]
  vozes: pt-BR-FranciscaNeural | pt-BR-AntonioNeural | pt-BR-ThalitaMultilingualNeural
"""
import asyncio
import json
import re
import sys

import edge_tts
from bs4 import BeautifulSoup


def limpar_texto(raw: str) -> str:
    t = raw or ""
    t = re.sub(r"\((?:pp?\.|páginas?)\s*[\d\s,eaà–\-]+\)", " ", t, flags=re.I)
    t = re.sub(r"[•▪◦·]", ", ", t)
    t = re.sub(r"(?:->|→|⇒)", " para ", t)
    t = re.sub(r"©.*$", " ", t)
    t = re.sub(r"\bArts\.\s*", "Artigos ", t)
    t = re.sub(r"\bArt\.\s*", "Artigo ", t)
    t = re.sub(r"§\s*", "parágrafo ", t)
    t = re.sub(r"\bnº\s*", "número ", t, flags=re.I)
    t = re.sub(r"\bex\.\s*:", "exemplo:", t, flags=re.I)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def texto_proprio(el) -> str:
    el = BeautifulSoup(str(el), "html.parser")  # cópia isolada
    for sel in el.select("ul,ol,table,figure,img,script,style,.ref-pagina"):
        sel.decompose()
    return limpar_texto(el.get_text())


def eh_item_de_indice(el) -> bool:
    if el.name != "li":
        return False
    a = el.find("a", href=re.compile(r"^#"))
    if not a:
        return False
    return limpar_texto(el.get_text()) == limpar_texto(a.get_text())


def extrair_blocos(html_path: str):
    with open(html_path, encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    root = soup.select_one(".container") or soup.body or soup
    blocos = []
    for el in root.find_all(["h1", "h2", "h3", "h4", "h5", "p", "li", "figcaption", "tr"]):
        if eh_item_de_indice(el):
            continue
        if el.name == "tr":
            if el.find(["p", "li", "h1", "h2", "h3", "h4", "h5"]):
                continue
            cels = [texto_proprio(td) for td in el.find_all(["td", "th"])]
            texto = " — ".join(c for c in cels if c)
        else:
            texto = texto_proprio(el)
        if len(texto) < 2:
            continue
        blocos.append(texto)
    return blocos


def preparar_fala(blocos):
    """Concatena blocos garantindo pontuação final (pausa natural entre eles)."""
    partes = []
    for b in blocos:
        if not re.search(r"[.!?:;]$", b):
            b += "."
        partes.append(b)
    return "\n".join(partes)


async def gerar(texto: str, voz: str, saida_mp3: str, saida_marks: str | None):
    com = edge_tts.Communicate(texto, voz, rate="+0%")
    marks = []
    with open(saida_mp3, "wb") as f:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary" and saida_marks:
                marks.append({"t": round(chunk["offset"] / 10_000_000, 3),
                              "o": chunk.get("text_offset", None)})
    if saida_marks:
        with open(saida_marks, "w", encoding="utf-8") as f:
            json.dump(marks, f, ensure_ascii=False)


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(1)
    html_path, voz, saida = sys.argv[1], sys.argv[2], sys.argv[3]
    marks = None
    if "--marks" in sys.argv:
        marks = sys.argv[sys.argv.index("--marks") + 1]
    blocos = extrair_blocos(html_path)
    texto = preparar_fala(blocos)
    print(f"blocos: {len(blocos)} | caracteres: {len(texto)}")
    asyncio.run(gerar(texto, voz, saida, marks))
    print(f"gerado: {saida}")


if __name__ == "__main__":
    main()
