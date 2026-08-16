# -*- coding: utf-8 -*-
"""Extrai as figuras dos slides do professor (LOC-slides.pdf) para o capitulo
"Bizuraco Prova" — secoes de manchas de sangue e de vidros.

Cada figura e um RECORTE RENDERIZADO da pagina (nao a imagem embutida crua),
porque nos slides as fotos vem fatiadas em varios xrefs e as marcacoes do
professor (setas amarelas, rotulos "1o/2o", elipses tracejadas) sao vetoriais,
desenhadas por cima. Renderizar preserva tudo isso.

A regiao de recorte e a uniao dos retangulos das imagens de CONTEUDO da pagina:
  - descarta as faixas que ocupam a largura toda (moldura do template do slide);
  - descarta as tarjas muito alongadas (titulos em bitmap).
As paginas sao giradas (rotation=90), por isso o retangulo passa pela
rotation_matrix antes de virar clip.
"""
import os
import pymupdf

PDF = r"c:\Users\BRUNO LUZ\Desktop\CFP - PERITO\Locais de Crime e suas Interfaces (LOC)\LOC-slides.pdf"
OUT = r"c:\Users\BRUNO LUZ\Desktop\CFP - PERITO\App_Questoes\materiais\LOC\img"

DPI = 130
PAD = 8            # folga, em pontos, ao redor do conteudo
LARG_MAX = 0.85    # imagem que passa disso da largura da pagina = moldura
ASPECTO_MAX = 5.5  # mais alongado que isso = tarja de titulo

# (pagina no PDF, nome do arquivo, formato)
FIGURAS = [
    # ---- manchas de sangue (secao 11) ----
    (550, "sangue_01_classificacao", "png"),
    (543, "sangue_02_cor", "jpg"),
    (554, "sangue_03_gotejadas_superficie", "jpg"),
    (553, "sangue_04_superficie_esquema", "png"),
    (555, "sangue_05_direcao_cauda", "jpg"),
    (556, "sangue_06_direcao_transporte", "jpg"),
    (566, "sangue_07_angulo_seno", "jpg"),
    (567, "sangue_08_bordas", "jpg"),
    (571, "sangue_09_arterial", "jpg"),
    (577, "sangue_10_castoff", "jpg"),
    (581, "sangue_11_impactadas", "jpg"),
    (584, "sangue_12_backspatter", "jpg"),
    (591, "sangue_13_contato", "jpg"),
    (592, "sangue_14_transferidas", "jpg"),
    (596, "sangue_15_sombra", "jpg"),
    (608, "sangue_16_sangue_sobre_sangue", "jpg"),
    (609, "sangue_17_poca_saturacao", "jpg"),
    (611, "sangue_18_escorrimento", "jpg"),
    # ---- vidros (secao 7.3) ----
    (291, "vidro_01_comum", "jpg"),
    (295, "vidro_02_temperado", "jpg"),
    (300, "vidro_03_laminado", "jpg"),
    (303, "vidro_04_blindado", "jpg"),
    (314, "vidro_05_cone_transfixacao", "png"),
    (321, "vidro_06_radiais", "jpg"),
    (324, "vidro_07_radiais_concentricas", "jpg"),
    (326, "vidro_08_riscos_direcao", "png"),
    (330, "vidro_09_ordem_impactos", "jpg"),
]


def clip_conteudo(page):
    """Retangulo (ja em coordenadas de exibicao) que cobre o conteudo util."""
    larg_pag = page.rect.width
    uniao = None
    for info in page.get_images(full=True):
        for r in page.get_image_rects(info[0]):
            r = r * page.rotation_matrix
            if r.width >= LARG_MAX * larg_pag:
                continue  # moldura do template
            lado_maior, lado_menor = max(r.width, r.height), min(r.width, r.height)
            if lado_menor and lado_maior / lado_menor >= ASPECTO_MAX:
                continue  # tarja de titulo
            uniao = r if uniao is None else uniao | r
    if uniao is None:
        return None
    uniao = pymupdf.Rect(uniao.x0 - PAD, uniao.y0 - PAD, uniao.x1 + PAD, uniao.y1 + PAD)
    return uniao & page.rect


def main():
    os.makedirs(OUT, exist_ok=True)
    doc = pymupdf.open(PDF)
    total = 0
    for num, nome, fmt in FIGURAS:
        page = doc[num - 1]
        clip = clip_conteudo(page)
        if clip is None:
            print("!! p%d (%s): nenhuma imagem de conteudo" % (num, nome))
            continue
        pix = page.get_pixmap(dpi=DPI, clip=clip)
        destino = os.path.join(OUT, "%s.%s" % (nome, fmt))
        if fmt == "jpg":
            pix.save(destino, jpg_quality=84)
        else:
            pix.save(destino)
        kb = os.path.getsize(destino) / 1024
        total += kb
        print("p%-4d %-34s %4dx%-4d  %6.0f KB" % (num, nome, pix.width, pix.height, kb))
    print("---- %d figuras, %.1f MB" % (len(FIGURAS), total / 1024))


if __name__ == "__main__":
    main()
