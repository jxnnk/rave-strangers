#!/usr/bin/env node
// PreToolUse (Bash): Wenn Claude `git commit` oder `git push` ausführt und Dateien in app/ geändert sind,
// muss auch der Service-Worker-Cache in app/sw.js hochgezählt sein (var CACHE='rs-shell-vNN').
// Sonst sehen Nutzer der PWA weiter die alte Version.
// Bei Fehlern im Hook selbst: nichts blockieren (fail-open).

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(raw);
    const cmd = String((input.tool_input || {}).command || '');
    const isCommit = /\bgit\b[^;&|\n]*\bcommit\b/.test(cmd);
    const isPush = /\bgit\b[^;&|\n]*\bpush\b/.test(cmd);
    if (!isCommit && !isPush) return;

    const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
    const git = (...args) => {
      try { return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); }
      catch (e) { return null; }
    };

    let files = [];
    let swDiff = '';
    if (isCommit) {
      files = (git('diff', '--name-only', 'HEAD') || '').split('\n');
      if (/\bgit\s+add\b/.test(cmd)) files = files.concat((git('ls-files', '--others', '--exclude-standard', 'app/') || '').split('\n'));
      swDiff = git('diff', 'HEAD', '--', 'app/sw.js') || '';
    } else {
      if (git('rev-parse', '--abbrev-ref', '@{u}') === null) return; // kein Upstream: nichts prüfen
      files = (git('diff', '--name-only', '@{u}..HEAD') || '').split('\n');
      swDiff = git('diff', '@{u}..HEAD', '--', 'app/sw.js') || '';
    }

    const appChanged = files.map((f) => f.trim()).filter((f) => f.startsWith('app/') && f !== 'app/sw.js');
    if (!appChanged.length) return;
    if (/^\+.*\bCACHE\s*=\s*['"]rs-shell-v\d+/m.test(swDiff)) return; // wurde hochgezählt

    let cur = '?', next = '?';
    try {
      const sw = fs.readFileSync(path.join(root, 'app', 'sw.js'), 'utf8');
      const m = sw.match(/rs-shell-v(\d+)/);
      if (m) { cur = 'rs-shell-v' + m[1]; next = 'rs-shell-v' + (Number(m[1]) + 1); }
    } catch (e) {}

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          'CLAUDE.md: Nach Änderungen an app/ den Cache in app/sw.js hochzählen. Geändert: ' +
          appChanged.slice(0, 5).join(', ') + (appChanged.length > 5 ? ' …' : '') +
          '. In app/sw.js ' + cur + ' auf ' + next + ' setzen, mit committen und den Befehl erneut ausführen.',
      },
    }));
  } catch (e) {
    // fail-open
  }
});
