# -*- coding: utf-8 -*-
"""Varre o MATERIAL COMPLETO das 5 disciplinas da prova e extrai as passagens que
usam palavras de ênfase/absoluto — o tipo de trecho que vira pegadinha de prova
("sempre", "nunca", "preferencialmente", "desejável", "somente"...).

Saída: _reform/decorebas/achados.json (para conferência e montagem do HTML).
Uso: python _reform/decorebas/extrair.py [--stats]
"""
import re, json, sys, html, unicodedata
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
RAIZ = Path(__file__).resolve().parents[2]
MAT = RAIZ / 'materiais'

DISCIPLINAS = [
    ('LOC',                 'LOC — Locais de Crime e suas Interfaces'),
    ('PCEB',                'Bombas e Explosivos'),
    ('BAL',                 'Balística Forense'),
    ('QUIMICA_FORENSE',     'Química Forense'),
    ('INFORMATICA_FORENSE', 'Informática Forense'),
]

# Grupos de gatilho. A ordem importa: o primeiro grupo que casar classifica a frase.
GRUPOS = [
    ('absoluto', 'Absolutos e negações totais', [
        r'sempre', r'nunca', r'jamais', r'em hip[óo]tese alguma', r'de forma alguma',
        r'necessariamente', r'obrigat[óo]ri\w*', r'imprescind[íi]vel\w*', r'indispens[áa]vel\w*',
        r'exclusivamente', r'unicamente', r'somente', r'apenas',
        r'vedad\w+', r'proibid\w+', r'\bveda-se\b', r'em nenhum\w*',
        # "todo o"/"toda a" quase sempre é adverbial ("durante toda a atividade") e
        # gerava ruído; ficam só os universais de fato.
        r'todos os\b', r'todas as\b', r'qualquer\b', r'nenhum[ao]?\b',
        r'invariavelmente', r'incondicional\w*',
    ]),
    ('preferencia', 'Preferência e recomendação', [
        r'preferencialmente', r'prefer[íi]vel', r'de prefer[êe]ncia', r'prioritariamente',
        r'desej[áa]vel', r'recomenda-se', r'recomend[áa]vel', r'recomendad\w+',
        r'aconselh[áa]vel', r'aconselha-se', r'sugere-se', r'sugerid\w+',
        r'ideal(?:mente)?\b', r'sempre que poss[íi]vel', r'quando poss[íi]vel',
        r'se poss[íi]vel', r'na medida do poss[íi]vel', r'evitar\b', r'evite\b',
        r'deve-se evitar', r'procure\b', r'melhor op[çc][ãa]o', r'boa pr[áa]tica',
    ]),
    ('regra_excecao', 'Regra geral e exceções', [
        r'em regra', r'via de regra', r'como regra', r'de modo geral', r'em geral',
        r'geralmente', r'normalmente', r'comumente', r'na maioria d\w+',
        r'salvo\b', r'exceto\b', r'ressalvad\w+', r'a menos que', r'exce[çc][ãa]o',
        r'\bem tese\b', r'excepcionalmente',
    ]),
    # "deve/pode" solto aparece em quase todo parágrafo descritivo e afogaria o
    # material; aqui só entram as formas que realmente proíbem ou obrigam.
    ('proibicao', 'Proibições e deveres estritos', [
        r'n[ãa]o\s+(?:se\s+)?deve\w*', r'n[ãa]o\s+(?:se\s+)?pode\w*',
        r'jamais\s+deve\w*', r'sob pena de', r'dever[áa]\s+obrigatoriamente',
        r'[ée]\s+facultad\w+', r'faculta-se', r'[ée]\s+defes\w+',
        r'n[ãa]o\s+[ée]\s+permitid\w+', r'n[ãa]o\s+[ée]\s+recomend\w+',
        r'deixar de\b',
    ]),
]

# Termos que, sozinhos, mudam o gabarito de uma questão — vão destacados no topo.
FORTES = re.compile(
    r'sempre|nunca|jamais|exclusivamente|unicamente|somente|apenas|'
    r'imprescind[íi]vel|indispens[áa]vel|obrigat[óo]ri|vedad|proibid|'
    r'preferencialmente|prefer[íi]vel|de prefer[êe]ncia|desej[áa]vel|'
    r'em regra|via de regra|necessariamente|em hip[óo]tese alguma', re.I)

# Lixo estrutural: legendas, tabelas achatadas e sobras de figura.
RUIDO_INICIO = re.compile(r'^(tabela|figura|quadro|gr[áa]fico|fonte|adaptad|fig\b|imagem)', re.I)

# Passagem histórica/narrativa: continua no material (a varredura é completa),
# mas não é "decoreba de prova" — não recebe o selo de decisivo.
NARRATIVO = re.compile(
    r'\b(1[6-9]\d{2}|20[0-2]\d)\b|nessa [ée]poca|naquela [ée]poca|s[ée]culo|'
    r'historicamente|ao longo da hist[óo]ria|surgiu|foi criad|originou|'
    r'primeira vez que|antigamente|na d[ée]cada', re.I)


def limpar_ocr(s):
    """O material de LOC veio de OCR: junta a hifenização de fim de linha
    ('permi- tindo' → 'permitindo') e corrige trocas comuns de dígito por letra."""
    s = re.sub(r'([a-zà-ÿ])-\s+([a-zà-ÿ])', r'\1\2', s)
    s = re.sub(r'\be/0U\b', 'e/ou', s, flags=re.I)
    s = re.sub(r'(?<=[A-Za-zÀ-ÿ])0(?=[A-Za-zÀ-ÿ])', 'o', s)
    return s


def eh_ruido(fr):
    if RUIDO_INICIO.match(fr):
        return True
    letras = [c for c in fr if c.isalpha()]
    if letras and sum(c.isupper() for c in letras) / len(letras) > 0.4:
        return True  # cabeçalho de lei / título em caixa alta
    digitos = sum(c.isdigit() for c in fr)
    if digitos > len(fr) * 0.18:          # linha de tabela achatada
        return True
    if len(re.findall(r'\b\d+[,.]\d+\b', fr)) >= 4:
        return True
    if not re.search(r'[a-zà-ÿ]{4,}\s+[a-zà-ÿ]{3,}', fr):  # sem prosa de verdade
        return True
    return False

GRUPO_RE = [(cid, nome, re.compile('|'.join(pats), re.I)) for cid, nome, pats in GRUPOS]

TAG = re.compile(r'<[^>]+>')
BLOCO = re.compile(
    r'<(h2|h3|h4|p|li|td|th)\b[^>]*>(.*?)</\1>', re.I | re.S)


def limpar(s):
    s = re.sub(r'<(script|style)\b.*?</\1>', ' ', s, flags=re.I | re.S)
    s = TAG.sub(' ', s)
    s = html.unescape(s)
    s = s.replace('\xa0', ' ')
    return re.sub(r'\s+', ' ', s).strip()


def frases(texto):
    """Divide em frases sem quebrar em abreviações comuns da apostila."""
    prot = texto
    for abrev in ['art.', 'arts.', 'inc.', 'p.', 'pp.', 'fig.', 'n.', 'nº', 'cap.',
                  'ex.', 'etc.', 'sr.', 'dr.', 'IN.', 'seg.', 'aprox.']:
        prot = re.sub(re.escape(abrev), abrev.replace('.', '\x00'), prot, flags=re.I)
    partes = re.split(r'(?<=[.!?;:])\s+(?=[A-ZÀ-Þ0-9])', prot)
    return [p.replace('\x00', '.').strip() for p in partes if p.strip()]


def classificar(frase):
    for cid, nome, rx in GRUPO_RE:
        m = rx.search(frase)
        if m:
            return cid, nome, m.group(0)
    return None, None, None


def processar(pasta, rotulo):
    base = MAT / pasta / 'COMPLETO'
    capitulos = []
    for arq in sorted(base.glob('Capitulo_*.html')):
        raw = arq.read_text(encoding='utf-8', errors='replace')
        corpo = raw.split('<div class="toc">')[-1]
        corpo = corpo.split('</body>')[0]
        m = re.search(r'<h1>(.*?)</h1>', raw, re.S)
        titulo = limpar(m.group(1)) if m else arq.stem

        secao = ''
        achados = []
        vistos = set()
        for tag, conteudo in BLOCO.findall(corpo):
            txt = limpar(conteudo)
            if not txt:
                continue
            if tag.lower() in ('h2', 'h3', 'h4'):
                secao = txt
                continue
            for fr in frases(txt):
                fr = limpar_ocr(fr)
                if len(fr) < 35 or len(fr) > 700:
                    continue
                if eh_ruido(fr):
                    continue
                cid, nome, termo = classificar(fr)
                if not cid:
                    continue
                chave = re.sub(r'\W+', '', fr.lower())[:120]
                if chave in vistos:
                    continue
                vistos.add(chave)
                forte = bool(FORTES.search(fr)) and not NARRATIVO.search(fr)
                achados.append({'grupo': cid, 'grupoNome': nome, 'termo': termo,
                                'forte': forte, 'secao': secao, 'texto': fr})
        if achados:
            capitulos.append({'arquivo': arq.name, 'titulo': titulo, 'achados': achados})
    return {'pasta': pasta, 'disciplina': rotulo, 'capitulos': capitulos}


def main():
    out = [processar(p, r) for p, r in DISCIPLINAS]
    dest = Path(__file__).parent / 'achados.json'
    dest.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')

    print(f'{"DISCIPLINA":<42}{"caps":>5}{"trechos":>9}')
    tot = 0
    for d in out:
        n = sum(len(c['achados']) for c in d['capitulos'])
        tot += n
        print(f'{d["disciplina"]:<42}{len(d["capitulos"]):>5}{n:>9}')
    print(f'{"TOTAL":<42}{"":>5}{tot:>9}')

    print('\nPor grupo:')
    porg = {}
    for d in out:
        for c in d['capitulos']:
            for a in c['achados']:
                porg[a['grupoNome']] = porg.get(a['grupoNome'], 0) + 1
    for k, v in sorted(porg.items(), key=lambda x: -x[1]):
        print(f'  {k:<38}{v:>6}')


main()
