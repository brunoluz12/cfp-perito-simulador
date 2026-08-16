# -*- coding: utf-8 -*-
"""Valida e emite as questoes novas do Cap. 4 do LOC.

Alem das checagens estruturais, confere as duas pistas que o usuario ja pegou
em lotes anteriores: a correta nao pode ser a MAIOR alternativa nem ficar
sistematicamente na posicao mais curta.
"""
import io, json, os, sys
from collections import Counter

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, "..", ".."))
sys.path.insert(0, AQUI)
from q_cap4 import Q, REF

DISCIPLINA = "LOC - Locais de Crime e suas Interfaces"
CONTEUDO = "Cap. 4 - Etapas de processamento do local"
ID_INICIAL = 4325
LETRAS = ["A", "B", "C", "D"]

erros = []
saida = []

for i, x in enumerate(Q):
    letra = x["letra"]
    if letra not in LETRAS:
        erros.append("Q%d: letra alvo invalida" % i)
        continue
    if len(x["erradas"]) != 3:
        erros.append("Q%d: precisa de 3 erradas (tem %d)" % (i, len(x["erradas"])))
        continue
    if x["ref"] not in REF:
        erros.append("Q%d: referencia invalida (%s)" % (i, x["ref"]))
        continue

    restantes = list(x["erradas"])
    alternativas = {L: (x["correta"] if L == letra else restantes.pop(0)) for L in LETRAS}

    if len(set(v.strip() for v in alternativas.values())) != 4:
        erros.append("Q%d: alternativas repetidas" % i)

    ordenadas = sorted(((len(v), k) for k, v in alternativas.items()), reverse=True)
    if ordenadas[0][1] == letra and ordenadas[0][0] > ordenadas[1][0] * 1.10:
        erros.append("Q%d: a correta e a MAIOR com folga (%d vs %d)"
                     % (i, ordenadas[0][0], ordenadas[1][0]))

    if "INCORRETA" not in x["enunciado"] and len(x["justificativa"]) < 200:
        erros.append("Q%d: justificativa curta demais" % i)

    saida.append({
        "id": ID_INICIAL + i,
        "disciplina": DISCIPLINA,
        "conteudo": CONTEUDO,
        "tipo": "multipla_escolha",
        "enunciado": x["enunciado"],
        "alternativas": alternativas,
        "resposta_correta": letra,
        "justificativa": x["justificativa"],
        "referencia": REF[x["ref"]],
        "nivel": x["nivel"],
    })

print("=" * 68)
print("questoes: %d | erros: %d" % (len(saida), len(erros)))
for e in erros:
    print("  !! " + e)

n = len(saida) or 1
rank = Counter()
for q in saida:
    od = sorted(((len(v), k) for k, v in q["alternativas"].items()), reverse=True)
    rank[[k for _, k in od].index(q["resposta_correta"]) + 1] += 1
print("\nrank de comprimento da correta (1 = a maior): " + "  ".join(
    "%do=%d(%.0f%%)" % (p, rank[p], 100.0 * rank[p] / n) for p in (1, 2, 3, 4)))
print("letra correta: %s" % dict(sorted(Counter(q["resposta_correta"] for q in saida).items())))
niveis = Counter(q["nivel"] for q in saida)
print("nivel: %s  ->  facil %.0f%% / medio %.0f%% / dificil %.0f%%"
      % (dict(niveis), 100.0 * niveis["facil"] / n, 100.0 * niveis["medio"] / n,
         100.0 * niveis["dificil"] / n))
print("secoes: %s" % dict(Counter(x["ref"] for x in Q)))
print("questoes 'assinale a INCORRETA': %d"
      % sum(1 for q in saida if "INCORRETA" in q["enunciado"]))

if erros:
    sys.exit(1)

destino = os.path.join(AQUI, "questoes_cap4.json")
io.open(destino, "w", encoding="utf8").write(json.dumps(saida, ensure_ascii=False, indent=2))
print("\nemitidas %d questoes (ids %d a %d) -> %s"
      % (len(saida), saida[0]["id"], saida[-1]["id"], os.path.basename(destino)))
print("=" * 68)
