# coding=utf-8
import io

with io.open('flashcards.js', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

new_lines = []

for i in range(len(lines)):
    if lines[i].startswith('// Utils'):
        utils_start = i
        break

new_lines.extend(lines[:utils_start])

format_text = """// Utils
function formatText(text) {
    if (!text) return '';
    let html = text.replace(/\\n/g, '<br>');
    html = html.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>\</strong>');
    html = html.replace(/\\*(.*?)\\*/g, '<em>\</em>');
    return html;
}

"""
new_lines.append(format_text)

init_start = -1
for i in range(utils_start, len(lines)):
    if lines[i].startswith('// Inicializa'):
        init_start = i
        break

if init_start != -1:
    new_lines.extend(lines[init_start:])

new_content = "".join(new_lines)

with io.open('flashcards.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
