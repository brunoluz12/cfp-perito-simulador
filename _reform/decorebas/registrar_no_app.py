# -*- coding: utf-8 -*-
"""Registra o capítulo "Pegadinhas" nas 5 disciplinas da prova dentro do app.js.

O item entra SEMPRE no fim do array `capitulos`: os capítulos escritos como
string têm o nome do arquivo derivado da posição (Capitulo_01, 02...), então
inserir no meio deslocaria todos eles.
Uso: python _reform/decorebas/registrar_no_app.py [--apply]
"""
import re, sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
APLICAR = '--apply' in sys.argv
APP = Path(__file__).parents[2] / 'app.js'
CHAVES = ['loc', 'pceb', 'bal', 'quimica_forense', 'informatica_forense']
ITEM = "{ titulo: '⚠️ Pegadinhas de ênfase', arquivo: 'Pegadinhas.html' }"

src = APP.read_text(encoding='utf-8')
ini = src.index('const materialData = {')
fim = src.index('// Disciplinas que possuem a versão completa')
bloco = src[ini:fim]
novo = bloco
feitos, pulados = [], []

for chave in CHAVES:
    m = re.search(r"'" + chave + r"':\s*\{.*?capitulos:\s*\[(.*?)(\n\s*)\]", novo, re.S)
    if not m:
        print(f'  ! nao encontrei a disciplina {chave}')
        continue
    caps = m.group(1)
    if 'Pegadinhas.html' in caps:
        pulados.append(chave)
        continue
    indent = re.match(r'\n(\s*)', m.group(2) or '\n                ')
    esp = ' ' * (len(indent.group(1)) + 4) if indent else '                '
    trecho = caps.rstrip()
    substituto = f'{trecho},\n{esp}{ITEM}{m.group(2)}]'
    novo = novo[:m.start(1)] + substituto + novo[m.end(0):]
    feitos.append(chave)

print('Adicionado em:', ', '.join(feitos) if feitos else '(nenhum)')
if pulados:
    print('Ja tinha (pulado):', ', '.join(pulados))

if not APLICAR:
    print('(dry-run) Use --apply para gravar.')
else:
    APP.write_text(src[:ini] + novo + src[fim:], encoding='utf-8')
    print('app.js atualizado.')
