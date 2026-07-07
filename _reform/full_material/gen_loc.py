# -*- coding: utf-8 -*-
"""
Constrói a versão COMPLETA do LOC a partir do OCR (Windows.Media.Ocr).
Entrada: diretório com pNNN.txt ("x<TAB>y<TAB>texto" por linha).
Divisão por faixas de páginas do sumário (memória do projeto).

Uso: python gen_loc.py <dir_ocr>
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_completo import Montador, esc, TEMPLATE  # noqa: E402

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

DISC_DIR = "materiais/LOC"
BADGE = "LOC - Locais de Crime e suas Interfaces"

# (arquivo, título, página inicial, página final) — páginas impressas
CAPS = [
    ("Capitulo_01.html", "Capítulo 1 - Introdução aos locais de crime", 13, 18),
    ("Capitulo_02.html", "Capítulo 2 - Metodologia do exame de local", 19, 22),
    ("Capitulo_03.html", "Capítulo 3 - Isolamento e preservação do local", 23, 28),
    ("Capitulo_04.html", "Capítulo 4 - Etapas de processamento do local", 29, 38),
    ("Capitulo_05.html", "Capítulo 5 - Documentação do local", 39, 48),
    ("Capitulo_06.html", "Capítulo 6 - Fotografia forense - conceitos básicos", 49, 54),
    ("Capitulo_07.html", "Capítulo 7 - Máquinas fotográficas", 55, 70),
    ("Capitulo_08.html", "Capítulo 8 - Fotografia na prática", 71, 74),
    ("Capitulo_09.html", "Capítulo 9 - Arquivos digitais", 75, 76),
    ("Capitulo_10.html", "Capítulo 10 - Captura da realidade (documentação 3D)", 77, 80),
    ("Capitulo_11.html", "Capítulo 11 - Escâneres a laser", 81, 84),
    ("Capitulo_12.html", "Capítulo 12 - Drones (RPA) na perícia de local", 85, 90),
    ("Capitulo_13.html", "Capítulo 13 - Vestígios e a dinâmica dos fatos", 91, 92),
    ("Capitulo_14.html", "Capítulo 14 - Vestígios químicos", 93, 102),
    ("Capitulo_15.html", "Capítulo 15 - Vestígios biológicos", 103, 128),
    ("Capitulo_16.html", "Capítulo 16 - Vestígios físicos", 129, 134),
    ("Capitulo_17.html", "Capítulo 17 - Microvestígios", 135, 144),
    ("Capitulo_18.html", "Capítulo 18 - Locais de crime contra o patrimônio", 145, 156),
    ("Capitulo_19.html", "Capítulo 19 - Locais de morte violenta", 157, 178),
    ("Capitulo_20.html", "Capítulo 20 - Desastres de massa (DVI)", 179, 186),
    ("Capitulo_21.html", "Capítulo 21 - O laudo pericial de local de crime", 187, 200),
]

SKIP = [
    re.compile(r"DOCUMENTO DE ACESSO RESTRITO", re.I),
    re.compile(r"Portaria n[ºo°]?\s*8\.?714", re.I),
    re.compile(r"^\d{1,3}$"),
    re.compile(r"^Locais de crime e suas interfaces", re.I),
    re.compile(r"^Academia Nacional", re.I),
]

NUM_RE = re.compile(r"^(\d+(?:\.\d+)*)\.?\s+(\S.*)$")
FIG_RE = re.compile(r"^(Figura|Tabela|Quadro|Foto)\s+\d+\s*[–\-—:]", re.I)
FIM_FRASE = re.compile(r'[.!?:;"”]\s*$')


def carregar_pagina(dir_ocr, p):
    """Devolve as linhas de texto da página na ordem de leitura do OCR.
    (As coordenadas gravadas não são confiáveis; usamos apenas o texto.)"""
    caminho = os.path.join(dir_ocr, f"p{p:03d}.txt")
    linhas = []
    if not os.path.exists(caminho):
        return linhas
    with open(caminho, encoding="utf-8") as f:
        for raw in f:
            partes = raw.rstrip("\n").split("\t", 2)
            txt = (partes[2] if len(partes) == 3 else raw).strip()
            if not txt or any(s.search(txt) for s in SKIP):
                continue
            linhas.append(txt)
    return linhas


def nivel_por_numero(numero):
    d = numero.count(".")
    return 2 if d <= 1 else (3 if d == 2 else 4)


def eh_titulo(txt, prox_cap_num):
    m = NUM_RE.match(txt)
    if not m:
        return None
    numero, resto = m.group(1), m.group(2)
    # evita tratar "1.500 metros" ou datas como título
    if len(resto) > 75 or FIM_FRASE.search(resto.rstrip()) and len(resto) > 55:
        return None
    if resto[:1].islower():
        return None
    raiz = int(numero.split(".")[0])
    if raiz != prox_cap_num:  # numeração de outro capítulo = falso positivo
        return None
    return numero, resto.rstrip(".")


def construir():
    dir_ocr = sys.argv[1]
    out_dir = os.path.join(DISC_DIR, "COMPLETO")
    os.makedirs(out_dir, exist_ok=True)

    for ci, (arquivo, titulo, p_ini, p_fim) in enumerate(CAPS):
        cap_num = ci + 1
        mont = Montador()
        # junta as linhas de todas as páginas do capítulo (parágrafos cruzam páginas)
        linhas = []
        for p in range(p_ini, p_fim + 1):
            linhas.extend(carregar_pagina(dir_ocr, p))
        for i, txt in enumerate(linhas):
            prox = linhas[i + 1] if i + 1 < len(linhas) else ""
            t = eh_titulo(txt, cap_num)
            if t:
                numero, resto = t
                mont.titulo(nivel_por_numero(numero), numero, resto)
                continue
            if FIG_RE.match(txt):
                mont.caption(txt)
                continue
            if txt.lstrip().startswith(("•", "—", "*")) or re.match(r"^-\s+[a-zà-ú]", txt):
                mont.bullet(txt, esc(txt))
                continue
            if mont.lista and txt[:1].islower():
                mont.bullet_cont(esc(txt))
                continue
            mont.linha_corpo(txt, esc(txt))
            # fecha o parágrafo quando a linha encerra frase E o que vem a seguir
            # inicia outra estrutura (título/figura/bullet) ou é linha final curta
            if FIM_FRASE.search(txt):
                prox_estrutural = (not prox or eh_titulo(prox, cap_num)
                                   or FIG_RE.match(prox)
                                   or prox.lstrip().startswith(("•", "—", "*")))
                if prox_estrutural or len(txt) < 58:
                    mont.fecha_paragrafo()
        mont.fecha_tudo()
        # artefato de OCR: palavras hifenizadas nas duas linhas ("técnico- -científicos")
        for j, (tipo, payload) in enumerate(mont.el):
            if tipo == "p":
                mont.el[j] = (tipo, re.sub(r"-\s+-", "-", payload))
        html_final = TEMPLATE.format(
            titulo_pagina=f"{titulo} (Completo) - {BADGE}",
            badge=esc(BADGE),
            titulo=esc(titulo),
            toc=mont.toc(),
            conteudo=mont.render(),
        )
        destino = os.path.join(out_dir, arquivo)
        with open(destino, "w", encoding="utf-8") as fh:
            fh.write(html_final)
        kb = os.path.getsize(destino) // 1024
        print(f"OK: {arquivo} (p.{p_ini}-{p_fim}, {kb} KB, {len(mont.el)} elementos)")


if __name__ == "__main__":
    construir()
