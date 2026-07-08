const assert = require('assert');

const {updatePackage} = require('./package-helper');

const basePackage = {
  name: 'cardano-message-signing',
  files: [
    'cardano_message_signing.js',
    'cardano_message_signing_bg.wasm',
  ],
};

assert.throws(() => updatePackage(basePackage, []), /Package target is required/);

const nodePackage = updatePackage(basePackage, ['-nodejs']);
assert.strictEqual(nodePackage.name, '@yoroi-classic/cardano-message-signing-nodejs');
assert.deepStrictEqual(nodePackage.repository, {
  type: 'git',
  url: 'git+https://github.com/yoroi-classic/message-signing.git',
});
assert.strictEqual(nodePackage.author, 'Yoroi Classic Contributors');
assert.strictEqual(nodePackage.license, 'MIT');
assert(nodePackage.files.includes('cardano_message_signing.js.flow'));
assert(nodePackage.files.includes('cardano_message_signing_bg.wasm'));

const nodeGcPackage = updatePackage(basePackage, ['-nodejs', '-gc']);
assert.strictEqual(nodeGcPackage.name, '@yoroi-classic/cardano-message-signing-nodejs-gc');

const browserPackage = updatePackage(basePackage, ['-browser']);
assert.strictEqual(browserPackage.name, '@yoroi-classic/cardano-message-signing-browser');
assert(browserPackage.files.includes('cardano_message_signing_bg.js'));
assert(browserPackage.files.includes('cardano_message_signing_bg.wasm'));

const asmPackage = updatePackage(basePackage, ['-asmjs']);
assert.strictEqual(asmPackage.name, '@yoroi-classic/cardano-message-signing-asmjs');
assert(asmPackage.files.includes('cardano_message_signing.asm.js'));
assert(asmPackage.files.includes('cardano_message_signing_bg.js'));
assert(!asmPackage.files.includes('cardano_message_signing_bg.wasm'));
