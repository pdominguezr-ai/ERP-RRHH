const fs = require('fs');
const path = require('path');
const http = require('http');
const plantumlEncoder = require('plantuml-encoder');

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    const file = fs.createWriteStream(destPath);
    http.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Status ${response.statusCode} for ${url}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(destPath));
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

const diagrams = [
  { src: 'docs/legacy/arquitectura_legado.puml', dest: 'docs/legacy/arquitectura_legado.png' },
  { src: 'docs/c4/c4_nivel1_contexto.puml', dest: 'docs/c4/c4_nivel1_contexto.png' },
  { src: 'docs/c4/c4_nivel2_contenedores.puml', dest: 'docs/c4/c4_nivel2_contenedores.png' },
  { src: 'docs/c4/c4_nivel3_componentes.puml', dest: 'docs/c4/c4_nivel3_componentes.png' },
  { src: 'docs/database/modelo_datos.puml', dest: 'docs/database/modelo_datos.png' },
  { src: 'docs/cache/estrategia_cache.puml', dest: 'docs/cache/estrategia_cache.png' },
];

async function main() {
  for (const d of diagrams) {
    try {
      if (!fs.existsSync(d.src)) {
        console.warn('Source file missing:', d.src);
        continue;
      }
      const content = fs.readFileSync(d.src, 'utf8');
      const encoded = plantumlEncoder.encode(content);
      const url = `http://www.plantuml.com/plantuml/png/${encoded}`;
      console.log(`Rendering ${d.src} -> ${d.dest}...`);
      await downloadImage(url, d.dest);
      const stat = fs.statSync(d.dest);
      console.log(`Saved ${d.dest} (${stat.size} bytes)`);
    } catch (e) {
      console.error(`Error rendering ${d.src}:`, e.message);
    }
  }
}

main();
