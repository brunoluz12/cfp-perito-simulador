const fs = require('fs');
const path = require('path');

const filesToFix = [
    'materiais/PVAT_MOD_2/HTML/Capitulo_06.html',
    'materiais/PVAT_MOD_2/HTML/Capitulo_07.html',
    'materiais/PVAT_MOD_2/HTML/Capitulo_08.html',
];

const scriptToInject = `
<script>
  function sendHeight() {
    var container = document.querySelector('.container') || document.body.firstElementChild || document.body;
    var height = container.offsetHeight + 40;
    window.parent.postMessage({ type: 'resize-iframe', height: height }, '*');
  }
  window.addEventListener('load', function() {
    setTimeout(sendHeight, 100);
  });
  window.addEventListener('resize', sendHeight);
  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(sendHeight);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
  }
</script>`;

for (const file of filesToFix) {
    const fullPath = path.join(__dirname, file);
    let content = fs.readFileSync(fullPath, 'utf-8');
    content = content.replace('</body>', scriptToInject + '\n</body>');
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log('Injected: ' + file);
}
