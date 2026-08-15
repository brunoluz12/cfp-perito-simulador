# -*- coding: utf-8 -*-
"""Monta, valida, equilibra e emite as questões do Bizuraço Prova."""
import io, json, sys, os
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import q_parte1, q_parte2, q_parte3, q_parte4
from permutar import equilibrar

DISCIPLINA = "LOC - Locais de Crime e suas Interfaces"
CONTEUDO = "Bizuraço Prova"
ID_INICIAL = 4174

TODAS = q_parte1.Q + q_parte2.Q + q_parte3.Q + q_parte4.Q
SECOES = {
    1: "Base legal e fundamentos", 2: "Roteiro de processamento",
    3: "Documentação: narrativa, croqui e fotografia", 4: "Fotografia forense",
    5: "Vestígios químicos", 6: "Vestígios biológicos",
    7: "Vestígios físicos e vidros", 8: "Microvestígios e ajuste físico",
    9: "Disparo de arma de fogo", 10: "Morte violenta e perinecroscópico",
    11: "Manchas de sangue", 12: "Crimes contra o patrimônio",
    13: "Reprodução simulada", 14: "Laudo pericial", 15: "Pegadinhas e divergências",
}


def relatorio(qs, titulo):
    tell = []
    rank = Counter()
    for i, x in enumerate(qs):
        a, c = x["alternativas"], x["resposta_correta"]
        od = sorted(((len(v), k) for k, v in a.items()), reverse=True)
        rank[[k for _, k in od].index(c) + 1] += 1
        if od[0][1] == c and od[0][0] > od[1][0] * 1.10:
            tell.append(i)
    n = len(qs)
    print("\n-- %s --" % titulo)
    print("correta e a MAIOR com folga >10%%: %d %s" % (len(tell), tell if tell else ""))
    print("rank de comprimento: " + "  ".join(
        "%da=%d(%.0f%%)" % (p, rank[p], 100.0 * rank[p] / n) for p in (1, 2, 3, 4)))
    print("letra correta: %s" % dict(sorted(Counter(x["resposta_correta"] for x in qs).items())))


# ---- validações estruturais ----
erros = []
for i, x in enumerate(TODAS):
    a = x["alternativas"]
    if sorted(a) != ["A", "B", "C", "D"]:
        erros.append("Q%d: alternativas != A-D" % i)
    if x["resposta_correta"] not in a:
        erros.append("Q%d: correta fora das alternativas" % i)
    if len(set(v.strip() for v in a.values())) != 4:
        erros.append("Q%d: alternativas duplicadas" % i)
    if x["secao"] not in SECOES:
        erros.append("Q%d: secao invalida" % i)

print("=" * 64)
print("total de questoes: %d | erros estruturais: %d" % (len(TODAS), len(erros)))
for e in erros:
    print("  " + e)

relatorio(TODAS, "ANTES do equilibrio")
equilibrar(TODAS)
relatorio(TODAS, "DEPOIS do equilibrio")

# ---- confere que o remapeamento nao quebrou as justificativas ----
import re
_std = re.compile(r"(?<![A-Za-zÀ-ú0-9])([ABCD])(?![A-Za-zÀ-ú0-9])")
sem_ref = [i for i, x in enumerate(TODAS) if not _std.search(x["justificativa"])]
print("\njustificativas sem qualquer referencia a alternativa: %d %s"
      % (len(sem_ref), sem_ref if sem_ref else ""))
auto = [i for i, x in enumerate(TODAS)
        if "INCORRETA" not in x["enunciado"] and re.search(r"(?<![A-Za-zÀ-ú0-9])%s(?![A-Za-zÀ-ú0-9])\s+(inverte|troca|nega|erra|confunde|cria|atribui|descreve|acrescenta|exclui|inclui|reduz|substitui|dispensa|antecipa|desloca|restringe|afirma|supõe|sugere|contraria|impõe|generaliza|converte|constrói|suprime|usa|fixa|inventa|alonga|estende|transporta|reproduz|coloca|mantém|acerta|trata|descarta|abre|veda|nega|salta|elimina|separa|limita)"
                  % x["resposta_correta"], x["justificativa"])]
print("justificativas que criticam a PROPRIA correta (deve ser 0): %d %s"
      % (len(auto), auto if auto else ""))

# ---- cobertura ----
print("\n-- cobertura por secao --")
c = Counter(x["secao"] for x in TODAS)
for k in sorted(SECOES):
    print("  %2d %-44s %d" % (k, SECOES[k], c.get(k, 0)))
print("\nquestoes 'o professor disse que cai': %d"
      % sum(1 for x in TODAS if x["prof"]))

# ---- emissão ----
saida = []
for n, x in enumerate(TODAS):
    just = x["justificativa"]
    if x["prof"]:
        just = "⭐ Ponto que o professor apontou expressamente na revisão. " + just
    saida.append({
        "id": ID_INICIAL + n,
        "disciplina": DISCIPLINA,
        "conteudo": CONTEUDO,
        "tipo": "multipla_escolha",
        "enunciado": x["enunciado"],
        "alternativas": x["alternativas"],
        "resposta_correta": x["resposta_correta"],
        "justificativa": just,
        "referencia": "Bizuraço Prova — %d. %s" % (x["secao"], SECOES[x["secao"]]),
        "nivel": x["nivel"],
    })

io.open("questoes_bizuraco.json", "w", encoding="utf8").write(
    json.dumps(saida, ensure_ascii=False, indent=2))
print("\nemitidas %d questoes (ids %d a %d) -> questoes_bizuraco.json"
      % (len(saida), saida[0]["id"], saida[-1]["id"]))
print("=" * 64)
