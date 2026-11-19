// Usage: node tools/check_sprites.js js/sprites_world.js [more files]
// Validates sprite definitions (16x16, palette chars) without a browser.
const fs = require('fs'), vm = require('vm'), path = require('path');
const problems = [];
const fakeCtx = { fillRect() {}, set fillStyle(v) {} };
const sandbox = {
  console: { warn: (m) => problems.push(m), log: console.log, error: console.error },
  document: { createElement: () => ({ width: 0, height: 0, getContext: () => fakeCtx }) },
};
sandbox.window = sandbox;
vm.createContext(sandbox);
const root = path.join(__dirname, '..');
for (const f of ['js/config.js', 'js/sprites.js', ...process.argv.slice(2)]) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sandbox, { filename: f });
}
const names = sandbox.Farm.Sprites.list();
for (const n of names) {
  const c = sandbox.Farm.Sprites.get(n);
  if (c.width !== 16 || c.height !== 16) problems.push(`${n}: size ${c.width}x${c.height}, expected 16x16`);
}
console.log(`Defined ${names.length} sprites: ${names.join(', ')}`);
if (problems.length) { console.log('PROBLEMS:\n' + problems.join('\n')); process.exit(1); }
console.log('OK');
