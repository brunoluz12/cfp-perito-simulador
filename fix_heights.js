const fs = require('fs');
const path = require('path');

const materiaisDir = path.join(__dirname, 'materiais');

// Match the entire sendHeight script block
const oldScriptPattern = /<script>\s*\n?\s*function sendHeight\(\)\s*\{[\s\S]*?<\/script>/g;

const newScript = `<script>
  (function() {
    var debounceTimer = null;
    function sendHeight() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function() {
        var container = document.querySelector('.container') || document.body.firstElementChild || document.body;
        var height = container.offsetHeight + 40;
        window.parent.postMessage({ type: 'resize-iframe', height: height }, '*');
      }, 100);
    }
    window.addEventListener('load', function() {
      setTimeout(sendHeight, 200);
    });
    window.addEventListener('resize', sendHeight);
    // No MutationObserver - it causes infinite resize loops
  })();
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
                oldScriptPattern.lastIndex = 0;
                content = content.replace(oldScriptPattern, newScript);
                fs.writeFileSync(fullPath, content, 'utf-8');
                totalFixed++;
                console.log('Fixed: ' + path.relative(__dirname, fullPath));
            } else if (content.includes('sendHeight')) {
                console.log('Has sendHeight but pattern miss: ' + path.relative(__dirname, fullPath));
            } else {
                console.log('No sendHeight: ' + path.relative(__dirname, fullPath));
            }
        }
    }
}

processDir(materiaisDir);
console.log('\\nTotal: ' + totalFiles + ', Fixed: ' + totalFixed);
