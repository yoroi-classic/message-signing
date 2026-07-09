const fs = require('fs');
const path = require('path');

function replaceWasmWithAsm(pkgDir = path.join(__dirname, '..', 'rust', 'pkg')) {
  const paths = [
    path.join(pkgDir, 'cardano_message_signing_bg.js'),
    path.join(pkgDir, 'cardano_message_signing.js'),
  ];

  paths.forEach((file) => {
    const data = fs.readFileSync(file, 'utf8');
    const result = data.replace(/_bg.wasm/g, '.asm.js');

    fs.writeFileSync(file, result, 'utf8');
  });

  fs.unlinkSync(path.join(pkgDir, 'cardano_message_signing_bg.wasm'));
}

if (require.main === module) {
  replaceWasmWithAsm();
}

module.exports = {
  replaceWasmWithAsm,
};
