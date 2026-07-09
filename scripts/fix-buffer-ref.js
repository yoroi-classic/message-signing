const fs = require('fs');
const path = require('path');

const regex = /(\s*if \(cached[A-Za-z0-9]+Memory[0-9]* === null ||) (cached[A-Za-z0-9]+Memory[0-9]*)\.byteLength === 0\) {/;
const replacer = '$1 $2.buffer !== wasm.memory.buffer) {';

function fixBufferRef(pkgDir = path.join(__dirname, '..', 'rust', 'pkg')) {
  const file = path.join(pkgDir, 'cardano_message_signing_bg.js');
  const inputFile = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  let replacements = 0;

  for (let i = 0; i < inputFile.length; ++i) {
    const line = inputFile[i];
    inputFile[i] = line.replace(regex, replacer);
    if (inputFile[i] !== line) {
      replacements += 1;
    }
  }

  fs.writeFileSync(file, inputFile.join('\n'));

  return replacements;
}

if (require.main === module) {
  fixBufferRef();
}

module.exports = {
  fixBufferRef,
};
