const fs = require('fs');

const css = fs.readFileSync('style.css', 'utf8');
const pfisterJs = fs.readFileSync('pfister.js', 'utf8');

const htmlTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste das Pirâmides Coloridas de Pfister - Simulador</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/@phosphor-icons/web@2.0.3/src/regular/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        ${css}
        
        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 20px;
            font-family: 'Inter', sans-serif;
            display: flex;
            justify-content: center;
        }
        
        #app {
            width: 100%;
            max-width: 800px;
            background: var(--panel-bg);
            border-radius: var(--radius-lg);
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            padding: 20px;
            box-sizing: border-box;
        }
    </style>
</head>
<body>
    <div id="app">
        <h2 style="text-align:center; margin-top:0;"><i class="ph ph-brain"></i> Teste Psicotécnico - Pfister</h2>
        <div id="psico-test-container"></div>
    </div>

    <script>
        ${pfisterJs}
        
        document.addEventListener('DOMContentLoaded', () => {
            document.documentElement.setAttribute('data-theme', 'dark');
            initPfister();
        });
    </script>
</body>
</html>`;

fs.writeFileSync('teste_psicotecnico.html', htmlTemplate);
console.log('Arquivo teste_psicotecnico.html gerado com sucesso!');
