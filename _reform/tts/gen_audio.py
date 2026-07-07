# -*- coding: utf-8 -*-
"""
Gera áudio neural (edge-tts) para capítulos de material do app, com
marcações de tempo por bloco (parágrafo) para sincronizar o destaque
no leitor tts_material.js.

A extração de blocos espelha as regras do tts_material.js:
pula índice, remove refs de página, lineariza tabelas, expande Art./§/nº.

Uso:
  # um capítulo:
  python gen_audio.py <capitulo.html> <voz> <saida.mp3>
  # disciplina inteira (HTML/*.html -> AUDIO/*.mp3 + *.json):
  python gen_audio.py --disc materiais/INFORMATICA_FORENSE --voice pt-BR-FranciscaNeural

Vozes: pt-BR-FranciscaNeural | pt-BR-AntonioNeural
"""
import asyncio
import glob
import json
import os
import re
import sys

import edge_tts
from bs4 import BeautifulSoup

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


# ---------------- Extração (espelha tts_material.js) ----------------

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


# ---------------- Síntese com marcações ----------------

def preparar_fala(blocos):
    """Concatena blocos com pontuação final; devolve texto e faixas [ini,fim) por bloco."""
    partes = []
    for b in blocos:
        if not re.search(r"[.!?:;]$", b):
            b += "."
        partes.append(b)
    faixas = []
    pos = 0
    for p in partes:
        faixas.append((pos, pos + len(p)))
        pos += len(p) + 1  # separador "\n"
    return "\n".join(partes), faixas


def bloco_da_posicao(faixas, pos):
    for i, (a, b) in enumerate(faixas):
        if a <= pos < b:
            return i
    return None


async def gerar_capitulo(html_path: str, voz: str, saida_mp3: str, saida_marks: str):
    blocos = extrair_blocos(html_path)
    if not blocos:
        print(f"  AVISO: nenhum bloco em {html_path} — pulado")
        return
    texto, faixas = preparar_fala(blocos)
    com = edge_tts.Communicate(texto, voz, boundary="SentenceBoundary")
    tempos = {}   # bloco -> primeiro offset (s)
    cursor = 0
    with open(saida_mp3, "wb") as f:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "SentenceBoundary":
                frag = (chunk.get("text") or "").strip()
                if not frag:
                    continue
                pos = texto.find(frag, cursor)
                if pos < 0:
                    pos = texto.find(frag)  # fallback sem cursor
                if pos < 0:
                    continue
                cursor = pos + len(frag)
                bi = bloco_da_posicao(faixas, pos)
                if bi is not None and bi not in tempos:
                    tempos[bi] = round(chunk["offset"] / 10_000_000, 3)
    # blocos sem boundary próprio herdam o tempo anterior (não deve ocorrer, mas garante)
    marks = []
    ultimo = 0.0
    for i, b in enumerate(blocos):
        t = tempos.get(i, ultimo)
        ultimo = t
        marks.append({"t": t, "s": b[:40]})
    with open(saida_marks, "w", encoding="utf-8") as f:
        json.dump({"v": 1, "voz": voz, "blocks": marks}, f, ensure_ascii=False)
    kb = os.path.getsize(saida_mp3) // 1024
    print(f"  OK: {os.path.basename(saida_mp3)} ({kb} KB, {len(blocos)} blocos, {len(tempos)} sincronizados)")


async def gerar_disciplina(disc_dir: str, voz: str):
    html_dir = os.path.join(disc_dir, "HTML")
    audio_dir = os.path.join(disc_dir, "AUDIO")
    os.makedirs(audio_dir, exist_ok=True)
    arquivos = sorted(glob.glob(os.path.join(html_dir, "*.html")))
    print(f"{len(arquivos)} capítulos em {html_dir} → {audio_dir} (voz {voz})")
    for arq in arquivos:
        nome = os.path.splitext(os.path.basename(arq))[0]
        mp3 = os.path.join(audio_dir, nome + ".mp3")
        marks = os.path.join(audio_dir, nome + ".json")
        print(f"- {nome}…")
        # até 3 tentativas (o serviço ocasionalmente derruba a conexão)
        for tentativa in range(3):
            try:
                await gerar_capitulo(arq, voz, mp3, marks)
                break
            except Exception as e:
                print(f"  tentativa {tentativa + 1} falhou: {e}")
                await asyncio.sleep(3)
        else:
            print(f"  ERRO: {nome} não gerado")


def main():
    if "--disc" in sys.argv:
        disc = sys.argv[sys.argv.index("--disc") + 1]
        voz = sys.argv[sys.argv.index("--voice") + 1] if "--voice" in sys.argv else "pt-BR-FranciscaNeural"
        asyncio.run(gerar_disciplina(disc, voz))
        return
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(1)
    html_path, voz, saida = sys.argv[1], sys.argv[2], sys.argv[3]
    marks = os.path.splitext(saida)[0] + ".json"
    asyncio.run(gerar_capitulo(html_path, voz, saida, marks))


if __name__ == "__main__":
    main()
