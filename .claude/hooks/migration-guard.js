#!/usr/bin/env node
// PreToolUse (Write|Edit|MultiEdit): setzt CLAUDE.md-Regel 5 durch.
// Migrationen dürfen keine Daten oder Strukturen vernichten.
//  - Blockiert: DROP TABLE/COLUMN/SCHEMA/VIEW/TYPE/... und TRUNCATE
//  - Erlaubt:   DROP POLICY/TRIGGER/FUNCTION/CONSTRAINT/INDEX (werden nur neu angelegt, keine Daten weg)
//  - Rückfrage: DELETE FROM (z. B. in Funktionen wie 016_delete_account legitim)
// Bei Fehlern im Hook selbst: nichts blockieren (fail-open).

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(raw);
    const ti = input.tool_input || {};
    const file = String(ti.file_path || '').replace(/\\/g, '/');
    if (!/\/supabase\/migrations\/[^/]+\.sql$/i.test(file) && !/^supabase\/migrations\/[^/]+\.sql$/i.test(file)) return;

    let text = '';
    if (typeof ti.content === 'string') text = ti.content;
    else if (typeof ti.new_string === 'string') text = ti.new_string;
    else if (Array.isArray(ti.edits)) text = ti.edits.map((e) => e.new_string || '').join('\n');
    if (!text) return;

    // Kommentare entfernen, damit "-- drop table ..." in Erklärungen nicht anschlägt
    const sql = text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/--[^\n]*/g, ' ');

    const allowedDrop = /^(policy|trigger|function|constraint|index)$/i;
    const badDrops = [];
    const dropRe = /\bdrop\s+(materialized\s+view|[a-z_]+)/gi;
    let m;
    while ((m = dropRe.exec(sql))) {
      const what = m[1].replace(/\s+/g, ' ');
      if (!allowedDrop.test(what)) badDrops.push('DROP ' + what.toUpperCase());
    }
    if (/\btruncate\b/i.test(sql)) badDrops.push('TRUNCATE');

    if (badDrops.length) {
      return out('deny',
        'Regel 5 (CLAUDE.md): Migrationen ohne DROP/DELETE. Gefunden: ' + [...new Set(badDrops)].join(', ') + '. ' +
        'Statt zu löschen: ausblenden (z. B. Venues über rules.hidden=true) oder Spalte/Tabelle stehen lassen. ' +
        'Erlaubt sind nur DROP POLICY/TRIGGER/FUNCTION/CONSTRAINT/INDEX, weil sie direkt neu angelegt werden.');
    }

    if (/\bdelete\s+from\b/i.test(sql)) {
      return out('ask',
        'Regel 5 (CLAUDE.md): Die Migration enthält DELETE FROM. Das ist nur in Ausnahmen okay ' +
        '(z. B. in einer Funktion wie 016_delete_account). Bitte bestätigen, dass keine bestehenden Daten gelöscht werden.');
    }
  } catch (e) {
    // fail-open
  }
});

function out(decision, reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: decision, permissionDecisionReason: reason },
  }));
}
