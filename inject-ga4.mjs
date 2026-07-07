import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const GA4_ID = 'G-KJR8JCWJY6';
const SNIPPET = `<!-- GA4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA4_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA4_ID}');
</script>`;

const DIST = new URL('./dist/', import.meta.url);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) files.push(...await walk(full));
    else if (e.name.endsWith('.html')) files.push(full);
  }
  return files;
}

const files = await walk(DIST.pathname);
let injected = 0;

for (const f of files) {
  const html = await readFile(f, 'utf8');
  if (html.includes(GA4_ID)) continue;
  if (!html.includes('</head>')) continue;
  await writeFile(f, html.replace('</head>', `${SNIPPET}\n</head>`));
  injected++;
  console.log(`  GA4 → ${f.replace(DIST.pathname, '')}`);
}

console.log(`GA4 injected into ${injected}/${files.length} HTML files.`);
