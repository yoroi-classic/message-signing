const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {fixBufferRef} = require('./fix-buffer-ref');
const {replaceWasmWithAsm} = require('./wasm-to-asm');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'message-signing-asm-'));

function file(name) {
  return path.join(tmpDir, name);
}

function read(name) {
  return fs.readFileSync(file(name), 'utf8');
}

try {
  fs.writeFileSync(
    file('cardano_message_signing.js'),
    'import * as wasm from "./cardano_message_signing_bg.wasm";\n'
  );
  fs.writeFileSync(
    file('cardano_message_signing_bg.js'),
    [
      'const wasmPath = "cardano_message_signing_bg.wasm";',
      'let cachedUint8Memory0 = null;',
      'function getUint8Memory0() {',
      '    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {',
      '        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);',
      '    }',
      '}',
      '',
    ].join('\n')
  );
  fs.writeFileSync(file('cardano_message_signing_bg.wasm'), 'wasm');

  replaceWasmWithAsm(tmpDir);

  assert(read('cardano_message_signing.js').includes('cardano_message_signing.asm.js'));
  assert(read('cardano_message_signing_bg.js').includes('cardano_message_signing.asm.js'));
  assert(!fs.existsSync(file('cardano_message_signing_bg.wasm')));

  const replacements = fixBufferRef(tmpDir);
  assert.strictEqual(replacements, 1);
  assert(read('cardano_message_signing_bg.js').includes(
    'cachedUint8Memory0.buffer !== wasm.memory.buffer'
  ));
} finally {
  fs.rmSync(tmpDir, {force: true, recursive: true});
}
