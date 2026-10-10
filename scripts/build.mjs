/** Build the self-contained designer preview, including fonts and images. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const { build } = await import(process.env.ACEIT_ESBUILD_PATH || 'esbuild');
const mime = { '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
async function embedded(relative) {
  return `data:${mime[path.extname(relative)]};base64,${(await fs.readFile(path.join(root,relative))).toString('base64')}`;
}
const assets = {};
for (const file of ['assets/logo.svg','assets/mascot.svg','assets/illustrations/together.png','assets/illustrations/question.png','assets/illustrations/discussion.png']) assets[file] = await embedded(file);
const built = await build({entryPoints:[path.join(root,'js/main.js')],bundle:true,format:'iife',target:['es2020'],write:false,minify:false,legalComments:'inline'});
let html = await fs.readFile(path.join(root,'index.html'),'utf8');
for (const name of ['tokens','base','components','site','app']) {
  let css = await fs.readFile(path.join(root,`css/${name}.css`),'utf8');
  css = css.replace('../assets/fonts/dm-sans.woff2', await embedded('assets/fonts/dm-sans.woff2'));
  html = html.replace(`<link rel="stylesheet" href="css/${name}.css">`,()=>`<style>\n${css}\n</style>`);
}
html = html.replace(/(src|href)="(assets\/[^\"]+)"/g, (match, attr, file) => {
  if (!assets[file]) throw new Error(`Missing embedded asset: ${file}`);
  if (attr === 'src') return `data-asset="${file}"`;
  return `${attr}="${assets[file]}"`;
});
const bootstrap = `window.ASSETS=${JSON.stringify(assets)};document.querySelectorAll('[data-asset]').forEach(img=>{img.src=window.ASSETS[img.dataset.asset]});\n`;
const script = (bootstrap+built.outputFiles[0].text).replace(/<\/script/gi,'<\\/script');
html = html.replace('<script type="module" src="js/main.js"></script>',()=>`<script>\n${script}\n</script>`);
const output = path.resolve(process.argv[2] || path.join(root,'dist/Aceitacademy_Redesigned.html'));
await fs.mkdir(path.dirname(output),{recursive:true});
await fs.writeFile(output,html);
console.log(`Built ${output} (${(Buffer.byteLength(html)/1024/1024).toFixed(2)} MiB)`);
