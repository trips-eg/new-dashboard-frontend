// Copies the TRIPS Staff app strings (lib/l10n/app_ar.arb, app_en.arb) into src/assets/i18n/{ar,en}.json under "APP",
// so the dashboard screens say exactly what the app says. Placeholders {n} become ngx-translate's {{n}}.
// Run after the app's strings change: node tools/sync-staff-strings.mjs D:/trips-staff-app/lib/l10n
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arbDir = process.argv[2] ?? 'D:/trips-staff-app/lib/l10n';

for (const lang of ['ar', 'en']) {
  const arb = JSON.parse(readFileSync(resolve(arbDir, `app_${lang}.arb`), 'utf8'));
  const app = {};
  for (const [key, value] of Object.entries(arb)) {
    if (key.startsWith('@')) continue;
    app[key] = String(value).replace(/\{(\w+)\}/g, '{{$1}}');
  }
  const file = resolve(root, `src/assets/i18n/${lang}.json`);
  const raw = readFileSync(file, 'utf8');
  const bom = raw.charCodeAt(0) === 0xfeff ? '\ufeff' : '';
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const json = JSON.parse(raw.replace(/^\ufeff/, ''));
  json.APP = app;
  writeFileSync(file, bom + JSON.stringify(json, null, 2).replace(/\n/g, eol) + eol);
  console.log(`${lang}: ${Object.keys(app).length} strings`);
}
