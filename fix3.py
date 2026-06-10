import io
with io.open('flashcards.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'select.innerHTML +=' in line and '<option value=\"\">' in line:
        lines[i] = '        select.innerHTML += <option value=""></option>;\n'

with io.open('flashcards.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
