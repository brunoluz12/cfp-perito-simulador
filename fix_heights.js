const fs = require('fs');
const path = require('path');

const materiaisDir = path.join(__dirname, 'materiais');

const oldScriptPattern = /<script>\s*function sendHeight\(\)\s*\{[\s\S]*?<\/script>/g;

const newScript = `<script>
  function sendHeight() {
    // Use the container's actual height, not scrollHeight which includes viewport
    var container = document.querySelector('.container') || document.body.firstElementChild || document.body;
    var height = container.offsetHeight + 40; // 40px padding
    window.parent.postMessage({ type: 'resize-iframe', height: height }, '*');
  }
  window.addEventListener('load', function() {
    // Small delay to ensure all images and styles are rendered
    setTimeout(sendHeight, 100);
  });
  window.addEventListener('resize', sendHeight);
  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(sendHeight);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
  }
</script>`;

let totalFixed = 0;
let totalFiles = 0;

function processDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            processDir(fullPath);
        } else if (entry.name.endsWith('.html')) {
            totalFiles++;
            let content = fs.readFileSync(fullPath, 'utf-8');
            if (oldScriptPattern.test(content)) {
                oldScriptPattern.lastIndex = 0; // reset regex
                content = content.replace(oldScriptPattern, newScript);
                fs.writeFileSync(fullPath, content, 'utf-8');
                totalFixed++;
                console.log('Fixed: ' + fullPath);
            } else {
                // Check if it has the sendHeight function at all
                if (content.includes('sendHeight')) {
                    console.log('Has sendHeight but pattern did not match: ' + fullPath);
                } else {
                    console.log('No sendHeight: ' + fullPath);
                }
            }
        }
    }
}

processDir(materiaisDir);
console.log('\nTotal HTML files: ' + totalFiles);
console.log('Total fixed: ' + totalFixed);
