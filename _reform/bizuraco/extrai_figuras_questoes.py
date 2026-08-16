# -*- coding: utf-8 -*-
"""Figuras para as QUESTOES de identificacao de mancha de sangue.

Mesma tecnica de recorte de extrai_figuras.py (renderiza a regiao das imagens
de conteudo da pagina, porque as fotos vem fatiadas e as marcacoes do professor
sao vetoriais). A diferenca e a escolha: aqui vao fotos que NAO aparecem no
capitulo, em especial os slides de exercicio da propria aula (p. 615-626), para
que a questao seja identificacao de verdade e nao memoria da legenda.

Saida no mesmo acervo do material (materiais/LOC/img), com prefixo q_.
"""
import os
import pymupdf

PDF = r"c:\Users\BRUNO LUZ\Desktop\CFP - PERITO\Locais de Crime e suas Interfaces (LOC)\LOC-slides.pdf"
OUT = r"c:\Users\BRUNO LUZ\Desktop\CFP - PERITO\App_Questoes\materiais\LOC\img"

DPI = 130
PAD = 8
LARG_MAX = 0.85
ASPECTO_MAX = 5.5

# Paginas em que o slide inteiro e um unico raster de largura total: o filtro
# automatico descarta tudo e sobra nada, entao o recorte vem escrito a mao.
CLIP_MANUAL = {
    621: (pymupdf.Rect(290, 235, 610, 503), 200),  # so a soleira com as gotas
}

FIGURAS = [
    (621, "q_sangue_01_gotejadas", "jpg"),        # gotas circulares isoladas na soleira
    (620, "q_sangue_02_arterial", "jpg"),         # arcos com escorrimento na parede
    (622, "q_sangue_03_castoff", "jpg"),          # sequencia arqueada sobre pano
    (578, "q_sangue_04_castoff_esquema", "jpg"),  # desenho do mecanismo do cast-off
    (582, "q_sangue_05_impactadas", "jpg"),       # muro de madeira, padrao radial
    (625, "q_sangue_06_impactadas_parede", "jpg"),# spray na parede + area borrada
    (616, "q_sangue_07_transferida", "jpg"),      # pegadas em sangue no piso
    (623, "q_sangue_08_saturacao", "jpg"),        # camisa encharcada
    (624, "q_sangue_09_poca", "jpg"),             # poca no piso do banheiro
    (595, "q_sangue_10_sombra", "jpg"),           # a MESMA cena do material, sem a marcacao
    (617, "q_sangue_11_escorrimento", "jpg"),     # escorrimentos verticais na parede
    (600, "q_sangue_12_trajeto", "jpg"),          # croqui com trilha de gotas pela casa
]


def clip_conteudo(page):
    larg_pag = page.rect.width
    uniao = None
    for info in page.get_images(full=True):
        for r in page.get_image_rects(info[0]):
            r = r * page.rotation_matrix
            if r.width >= LARG_MAX * larg_pag:
                continue
            maior, menor = max(r.width, r.height), min(r.width, r.height)
            if menor and maior / menor >= ASPECTO_MAX:
                continue
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
        if num in CLIP_MANUAL:
            clip, dpi = CLIP_MANUAL[num]
        else:
            clip, dpi = clip_conteudo(page), DPI
        if clip is None:
            print("!! p%d (%s): nenhuma imagem de conteudo" % (num, nome))
            continue
        pix = page.get_pixmap(dpi=dpi, clip=clip)
        destino = os.path.join(OUT, "%s.%s" % (nome, fmt))
        pix.save(destino, jpg_quality=84) if fmt == "jpg" else pix.save(destino)
        kb = os.path.getsize(destino) / 1024
        total += kb
        print("p%-4d %-32s %4dx%-4d %6.0f KB" % (num, nome, pix.width, pix.height, kb))
    print("---- %d figuras, %.1f MB" % (len(FIGURAS), total / 1024))


if __name__ == "__main__":
    main()
