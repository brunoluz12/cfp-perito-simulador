# Questões de matriz cruzada — LOC (andamento)

Documento de retomada. Se a sessão reiniciar, ler este arquivo é suficiente para
continuar de onde parou.

## O que é o estilo "matriz cruzada"

Pedido do usuário: questões que forcem a decorar as listas que o caderno cruza
(método × material × cuidado). **O distrator nunca é invenção** — é o descritor
VERDADEIRO de outro item da mesma lista. Quem não decorou o par certo não
consegue eliminar por bom senso.

Exemplo dado pelo usuário:

> Em regra, a pinça é utilizada na coleta de quais itens ou áreas?
> A) Material particulado visível ← correta (pinças)
> B) Materiais soltos ou aderidos ← é raspagem
> C) Área extensa; vestígios pouco acessíveis ← é vácuo
> D) Menos seletivo ← é vácuo

## Regras obrigatórias (validadas por script antes de gravar)

1. **A alternativa correta NUNCA pode ser a mais extensa.** Regra fixa da casa —
   muita gente resolve prova chutando a mais longa. O validador reprova.
   (Na prática eu violo isso em ~40% das questões que escrevo: a correta pede
   mais precisão. Sempre conferir e reescrever, encurtando a correta ou dando
   mais corpo ao distrator.)
2. **Gabarito equilibrado entre A, B, C e D.** Escrevendo na ordem natural sai
   A=25/D=0, que é tão explorável quanto o comprimento. O script gira a posição
   da correta (A→B→C→D) automaticamente.
3. **A justificativa cita o CONTEÚDO do distrator, nunca a letra.** Se citar
   letra ("B é fita adesiva"), o rebalanceamento do item 2 quebra a referência.
4. 4 alternativas, `tipo: "multipla_escolha"`, sem repetir informação entre
   questões (cada fato aparece uma vez como resposta; depois só como distrator).

## Arquivos do banco

- `banco_questoes.json` — array puro, `JSON.stringify(arr, null, 2)`.
- `banco_questoes.js` — **exatamente** `const questoesDB = ` + o mesmo JSON + `;`.
  Os dois precisam ficar sincronizados (o validador confere).
- Backups automáticos: `banco_questoes.backup_<ISO>.json` (não versionados).
- Campos: `id, disciplina, conteudo, tipo, enunciado, alternativas, resposta_correta, justificativa, referencia, nivel`.
- `disciplina`: `LOC - Locais de Crime e suas Interfaces`
- `referencia`: `PDF LOC, p. NNN`
- `nivel`: `dificil` (maioria) ou `medio`

## Fonte

`../Locais de Crime e suas Interfaces (LOC)/LOC.pdf` — 200 páginas, **escaneado,
sem camada de texto e sem OCR disponível na máquina** (não há tesseract nem
pytesseract). O jeito de ler é renderizar a página e ler como imagem:

```python
import pymupdf
d = pymupdf.open('LOC.pdf')
d[i].get_pixmap(matrix=pymupdf.Matrix(2.0, 2.0)).save('saida_%d.png' % (i+1))
# atenção: índice i é 0-based; a página impressa NNN é d[NNN-1]
```
A numeração impressa coincide com a do PDF (página 91 impressa = `d[90]`).

## Situação (13/08/2026)

| Capítulo | Páginas | Status | Questões |
|---|---|---|---|
| 13 — Vestígios e a dinâmica dos fatos | 91 | ✅ feito | 4 novas (11 no total) |
| 14 — Vestígios químicos | 93-101 | ✅ feito | 26 novas (38 no total) |
| 15 — Vestígios biológicos | 103-128 | 🟡 **em andamento** | 54 novas (74 no total) — falta p. 121-128 |
| 16 — Vestígios físicos | 129-134 | ✅ feito | 17 novas (29 no total) |
| 17 — Microvestígios | 135-142 | ✅ feito | 46 novas (58 no total) |

Commits: `062ae86` (Cap. 17) e `b40bc99` (Caps. 13/14/16), repositório
`brunoluz12/cfp-perito-simulador`, branch `master`.

## O que falta: Capítulo 15 (p. 103-128)

O maior e mais denso — 26 páginas. Sumário:

- 15.1 Coleta, acondicionamento, identificação e preservação (103)
- 15.1.1 Degradação do DNA: fatores que inviabilizam a análise (104)
- 15.1.2 Materiais adequados: a maleta de vestígios biológicos (105)
- 15.1.3 Cuidados iniciais (107) · 15.1.4 Descarte e desinfecção (107)
- 15.1.5 Antes de se dirigir ao local (108)
- 15.1.6 Procedimentos iniciais / pré-coleta (108)
  - 15.1.6.1.1 Testes preliminares para sangue (109)
  - 15.1.6.1.2 Testes de origem para sangue humano (111)
- 15.1.7 Coleta (111) — **matriz principal das técnicas**:
  - 15.1.7.1.1 suabe (112) · 15.1.7.1.2 raspagem (115)
  - 15.1.7.1.3 remoção total ou parcial do suporte (116)
  - 15.1.7.1.4 seringa (118) · 15.1.7.1.5 pinça (119)
- 15.1.8 Preservação dos vestígios biológicos (119)
- 15.1.9 **Técnica recomendada em função do tipo de vestígio (121)** — a matriz
  mais rica do capítulo: sangue (121), sêmen (122), pelos e cabelos (123),
  saliva (123), suor (124), células epiteliais e impressões digitais (124),
  tecidos orgânicos (124), ossos e dentes (124), projéteis (124), coleta em
  cadáveres (125), coleta em pessoas vivas / amostras de referência (125)
- 15.2 Embalagem e envio para exame de DNA (127)
- 15.3 Amostras para análises toxicológicas (127) — ante-mortem (128) e
  post-mortem (128)

**Fatiamento** (inserir e commitar a cada fatia, para não perder trabalho):

1. ✅ **FEITA** — p. 103-108: degradação do DNA (4 fatores), maleta / Apêndice II
   da IT, cuidados iniciais, descarte e desinfecção (5 etapas), pré-coleta e
   localização dos vestígios. 21 questões, ids 3209-3229.
2. ✅ **FEITA** — p. 109-120: tabela vestígio × localização × fonte do DNA (14
   linhas), testes preliminares de cor para sangue, testes de origem,
   documentação/SISCRIM, fatores de escolha da técnica (absorvente ×
   não absorvente, móvel × imóvel), as 5 técnicas de coleta (suabe, raspagem,
   remoção do suporte, seringa, pinça), o quadro "como secar", o envelope
   primário e a preservação (ambiente / 4°C / -20°C). 33 questões, ids 3230-3262.
3. ⬜ **PRÓXIMA** — p. 121-128: a matriz do 15.1.9 (técnica recomendada em
   função do tipo de vestígio — sangue, sêmen, pelos e cabelos, saliva, suor,
   células epiteliais, tecidos orgânicos, ossos e dentes, projéteis, coleta em
   cadáveres e em pessoas vivas), embalagem e envio para exame de DNA (127) e
   amostras para análises toxicológicas, ante e post-mortem (127-128)

**Correção feita no validador durante a fatia 1:** a regra da extensão só pode
reprovar quando a correta é ESTRITAMENTE a maior. Havendo empate no tamanho
(ex.: "A4, A3 e A1" / "A3, A2 e A1"…), não existe vantagem para o chute e o
empate não é violação. Trecho correto:

```js
const tamCorreta = n.alternativas[n.resposta_correta].length;
const outras = alts.filter(([k]) => k !== n.resposta_correta).map(([, v]) => v.length);
if (outras.every((t) => tamCorreta > t)) { /* reprova */ }
```

## Como inserir (modelo de script)

Copiar a estrutura de um dos scripts já usados: array `NOVAS` com o helper `q()`,
depois o bloco de rebalanceamento do gabarito, depois a validação, e só então a
gravação com `--aplicar` (sempre com backup antes). O script roda em dry-run por
padrão. Ao final: `git add banco_questoes.json banco_questoes.js` e commit com
mensagem no padrão `Questoes: ...` (sem acentos, como os demais do repositório).
