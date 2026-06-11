const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            processDir(fullPath);
        } else if (entry.name === 'estilo_padrao.css') {
            let content = fs.readFileSync(fullPath, 'utf-8');
            if (!content.includes('overflow-y: hidden;')) {
                content = content.replace(/body\s*\{/, 'body {\n  overflow-y: hidden;');
                fs.writeFileSync(fullPath, content, 'utf-8');
                console.log('Fixed CSS: ' + fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'materiais'));
