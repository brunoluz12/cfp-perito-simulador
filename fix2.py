import io
import re

with io.open('flashcards.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'select.innerHTML \+= \<option value=\"\\"\>\\\</option\>\\;', 'select.innerHTML += <option value=""></option>;', content)

with io.open('flashcards.js', 'w', encoding='utf-8') as f:
    f.write(content)
