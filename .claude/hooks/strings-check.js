#!/usr/bin/env node
// CLAUDE.md-Regel 8: Texte immer DE + EN, keine doppelten Keys.
// Prüft app/app.js (var T={de:{…},en:{…}}) und flutter_app/lib/strings.dart ('de': {…}, 'en': {…}).
//
// Als Hook (PostToolUse Write|Edit|MultiEdit): prüft nur die gerade bearbeitete Datei,
//   meldet Probleme an Claude (Exit 2), damit sie sofort behoben werden.
// Von Hand:  node .claude/hooks/strings-check.js   prüft beide Dateien.

const fs = require('fs');
const path = require('path');

const TARGETS = [
  { rel: 'app/app.js', de: /\bde\s*:\s*\{/, en: /\ben\s*:\s*\{/ },
  { rel: 'flutter_app/lib/strings.dart', de: /'de'\s*:\s*\{/, en: /'en'\s*:\s*\{/ },
];

// Liest die Keys eines Objekt-/Map-Literals ab der öffnenden Klammer.
// Überspringt Strings und Kommentare, zählt nur Keys auf oberster Ebene.
function readKeys(src, openIdx) {
  const keys = [];
  let depth = 0, i = openIdx, expectKey = false;
  while (i < src.length) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); if (i < 0) break; continue; }
    if (c === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i + 2); if (i < 0) break; i += 2; continue; }
    if (c === "'" || c === '"' || c === '`') {
      let j = i + 1;
      while (j < src.length && src[j] !== c) { if (src[j] === '\\') j++; j++; }
      if (depth === 1 && expectKey && /^\s*:/.test(src.slice(j + 1, j + 20))) keys.push(src.slice(i + 1, j));
      expectKey = false; i = j + 1; continue;
    }
    if (c === '{' || c === '[' || c === '(') { depth++; if (depth === 1) expectKey = true; i++; continue; }
    if (c === '}' || c === ']' || c === ')') { depth--; if (depth === 0) break; i++; continue; }
    if (depth === 1 && c === ',') { expectKey = true; i++; continue; }
    if (depth === 1 && expectKey && /[A-Za-z_$]/.test(c)) {
      const m = /^[A-Za-z_$][\w$]*/.exec(src.slice(i));
      if (/^\s*:/.test(src.slice(i + m[0].length, i + m[0].length + 20))) keys.push(m[0]);
      expectKey = false; i += m[0].length; continue;
    }
    if (!/\s/.test(c)) expectKey = false;
    i++;
  }
  return keys;
}

function check(root, t) {
  const file = path.join(root, t.rel);
  if (!fs.existsSync(file)) return [];
  const src = fs.readFileSync(file, 'utf8');
  const d = t.de.exec(src), e = t.en.exec(src);
  if (!d || !e) return [];
  const de = readKeys(src, d.index + d[0].length - 1);
  const en = readKeys(src, e.index + e[0].length - 1);
  const problems = [];
  const dups = (arr) => [...new Set(arr.filter((k, i) => arr.indexOf(k) !== i))];
  const dDe = dups(de), dEn = dups(en);
  const sDe = new Set(de), sEn = new Set(en);
  const onlyDe = [...sDe].filter((k) => !sEn.has(k));
  const onlyEn = [...sEn].filter((k) => !sDe.has(k));
  if (dDe.length) problems.push(`${t.rel}: doppelte Keys in DE: ${dDe.join(', ')}`);
  if (dEn.length) problems.push(`${t.rel}: doppelte Keys in EN: ${dEn.join(', ')}`);
  if (onlyDe.length) problems.push(`${t.rel}: fehlt in EN: ${onlyDe.join(', ')}`);
  if (onlyEn.length) problems.push(`${t.rel}: fehlt in DE: ${onlyEn.join(', ')}`);
  return problems;
}

function report(problems, asHook) {
  if (!problems.length) { if (!asHook) console.log('Strings OK (DE/EN vollständig, keine doppelten Keys).'); process.exit(0); }
  console.error('Regel 8 (CLAUDE.md): Texte immer DE + EN, keine doppelten Keys.\n- ' + problems.join('\n- '));
  process.exit(asHook ? 2 : 1);
}

if (process.stdin.isTTY) {
  const root = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '..', '..');
  report(TARGETS.flatMap((t) => check(root, t)), false);
} else {
  let raw = '';
  process.stdin.on('data', (c) => (raw += c));
  process.stdin.on('end', () => {
    try {
      const input = JSON.parse(raw);
      const file = String((input.tool_input || {}).file_path || '').replace(/\\/g, '/');
      const t = TARGETS.find((x) => file === x.rel || file.endsWith('/' + x.rel));
      if (!t) process.exit(0);
      const root = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '..', '..');
      report(check(root, t), true);
    } catch (e) {
      process.exit(0); // fail-open
    }
  });
}
