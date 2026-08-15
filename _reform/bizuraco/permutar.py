# -*- coding: utf-8 -*-
"""Equilibra a letra da resposta correta por transposição, remapeando as
referências às alternativas dentro da justificativa.

Só a letra "A" é ambígua em português (artigo). O levantamento dos contextos
mostrou que "A" seguido de SUBSTANTIVO é artigo e "A" seguido de verbo, de
vírgula, de "e" ou de "é" é referência à alternativa. Os substantivos
observados são protegidos por sentinela antes do remapeamento.
"""
import re

ARTIGO_SEGUINTES = {
    "regra", "razão", "ordem", "distinção", "sequência", "amostra", "liberação",
    "busca", "preparação", "narrativa", "foto", "câmera", "pegadinha", "definição",
    "luz", "cor", "recomendação", "inconstância", "numeração", "conclusão",
    "afirmação", "apostila", "base", "coleta", "ausência", "escala", "câmara",
    "iluminação", "varredura", "entrega", "dinâmica", "análise", "premissa",
    "primeira", "segunda", "terceira", "questão", "alternativa", "prova",
    "perícia", "presença", "resposta", "função", "etapa", "forma", "cadeia",
}

SENT = "\x00ART\x00"
_re_letra = re.compile(r"(?<![A-Za-zÀ-ú0-9])([ABCD])(?![A-Za-zÀ-ú0-9])")
_re_artigo = re.compile(r"(?<![A-Za-zÀ-ú0-9])A(?=\s+([a-zà-ú]+))")


def _protege(txt):
    def sub(m):
        return SENT if m.group(1) in ARTIGO_SEGUINTES else m.group(0)
    return _re_artigo.sub(sub, txt)


def remapear(txt, de, para):
    """Troca as letras `de` e `para` entre si nas referências às alternativas."""
    txt = _protege(txt)
    tmp = "\x01"
    txt = _re_letra.sub(lambda m: tmp if m.group(1) == de else m.group(1), txt)
    txt = _re_letra.sub(lambda m: de if m.group(1) == para else m.group(1), txt)
    txt = txt.replace(tmp, para)
    return txt.replace(SENT, "A")


def equilibrar(questoes):
    """Transpõe a correta para a letra mais sub-representada, quando a sua
    estiver acima da cota. Retorna a lista modificada in place."""
    n = len(questoes)
    cota = n / 4.0
    cont = {L: sum(1 for q in questoes if q["resposta_correta"] == L) for L in "ABCD"}
    alvo = {L: cota for L in "ABCD"}

    for q in questoes:
        c = q["resposta_correta"]
        if cont[c] <= alvo[c]:
            continue
        # letra mais sub-representada
        cand = min("ABCD", key=lambda L: cont[L])
        if cand == c or cont[cand] >= alvo[cand]:
            continue
        a = q["alternativas"]
        a[c], a[cand] = a[cand], a[c]
        q["resposta_correta"] = cand
        q["justificativa"] = remapear(q["justificativa"], c, cand)
        cont[c] -= 1
        cont[cand] += 1
    return questoes
