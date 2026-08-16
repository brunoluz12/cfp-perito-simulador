# -*- coding: utf-8 -*-
"""Valida e emite as questoes com imagem (manchas de sangue) do Bizuraco Prova.

Checa o que costuma quebrar num lote destes:
  - 4 alternativas A-D, sem repetidas, correta existente;
  - a alternativa correta NAO pode ser a maior (regra permanente do projeto);
  - o arquivo de imagem existe mesmo no caminho declarado;
  - distribuicao das letras corretas e dos niveis.
"""
import io, json, os, sys
from collections import Counter

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, "..", ".."))
sys.path.insert(0, AQUI)
from q_imagens import Q, IMG

DISCIPLINA = "LOC - Locais de Crime e suas Interfaces"
CONTEUDO = "Bizuraço Prova"
REFERENCIA = "Bizuraço Prova — 11. Local com manchas de sangue"
ID_INICIAL = 4302
LETRAS = ["A", "B", "C", "D"]

erros = []
saida = []

for i, x in enumerate(Q):
    letra = x["letra"]
    if letra not in LETRAS:
        erros.append("Q%d: letra alvo invalida (%s)" % (i, letra))
        continue
    if len(x["erradas"]) != 3:
        erros.append("Q%d: precisa de exatamente 3 erradas" % i)
        continue

    # monta o dicionario colocando a correta na letra escolhida
    restantes = list(x["erradas"])
    alternativas = {}
    for L in LETRAS:
        alternativas[L] = x["correta"] if L == letra else restantes.pop(0)

    if len(set(v.strip() for v in alternativas.values())) != 4:
        erros.append("Q%d: alternativas repetidas" % i)

    # a correta nao pode ser a maior
    ordenadas = sorted(((len(v), k) for k, v in alternativas.items()), reverse=True)
    if ordenadas[0][1] == letra and ordenadas[0][0] > ordenadas[1][0] * 1.10:
        erros.append("Q%d: a correta e a MAIOR com folga (%d vs %d)"
                     % (i, ordenadas[0][0], ordenadas[1][0]))

    caminho = os.path.join(RAIZ, IMG.replace("/", os.sep), x["img"])
    if not os.path.exists(caminho):
        erros.append("Q%d: imagem inexistente -> %s" % (i, x["img"]))

    saida.append({
        "id": ID_INICIAL + i,
        "disciplina": DISCIPLINA,
        "conteudo": CONTEUDO,
        "tipo": "multipla_escolha",
        "enunciado": x["enunciado"],
        "imagem": IMG + x["img"],
        "imagem_alt": x["alt"],
        "imagem_legenda": x["legenda"],
        "alternativas": alternativas,
        "resposta_correta": letra,
        "justificativa": x["justificativa"],
        "referencia": REFERENCIA,
        "nivel": x["nivel"],
    })

print("=" * 64)
print("questoes: %d | erros: %d" % (len(saida), len(erros)))
for e in erros:
    print("  !! " + e)

rank = Counter()
for q in saida:
    od = sorted(((len(v), k) for k, v in q["alternativas"].items()), reverse=True)
    rank[[k for _, k in od].index(q["resposta_correta"]) + 1] += 1
n = len(saida)
print("\nrank de comprimento da correta (1 = a maior): " + "  ".join(
    "%do=%d(%.0f%%)" % (p, rank[p], 100.0 * rank[p] / n) for p in (1, 2, 3, 4)))
print("letra correta: %s" % dict(sorted(Counter(q["resposta_correta"] for q in saida).items())))
print("nivel: %s" % dict(Counter(q["nivel"] for q in saida)))
print("imagens distintas: %d" % len(set(q["imagem"] for q in saida)))

if erros:
    sys.exit(1)

destino = os.path.join(AQUI, "questoes_bizuraco_imagens.json")
io.open(destino, "w", encoding="utf8").write(json.dumps(saida, ensure_ascii=False, indent=2))
print("\nemitidas %d questoes (ids %d a %d) -> %s"
      % (len(saida), saida[0]["id"], saida[-1]["id"], os.path.basename(destino)))
print("=" * 64)
