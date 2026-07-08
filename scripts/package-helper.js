const fs = require('fs');

function addFile(files, file) {
  return files.find(entry => entry === file) == null ? [...files, file] : files;
}

function updatePackage(pkg, args) {
  const target = args[0];
  if (!target) {
    throw new Error('Package target is required');
  }

  const nextPkg = {
    ...pkg,
    files: Array.isArray(pkg.files) ? [...pkg.files] : [],
  };

  nextPkg.files = addFile(nextPkg.files, 'cardano_message_signing.js.flow');

  if (nextPkg.name === 'cardano-message-signing') {
    nextPkg.name = '@yoroi-classic/' + nextPkg.name + target;
    const optionalArg = args[1];
    if (optionalArg) {
      nextPkg.name += optionalArg;
    }
  }

  if (target === '-browser' || target === '-asmjs') {
    // due to a bug in wasm-pack, this file is missing from browser builds
    nextPkg.files = addFile(nextPkg.files, 'cardano_message_signing_bg.js');
  }

  if (target === '-asmjs') {
    // need to replace WASM with ASM package
    nextPkg.files = [
      'cardano_message_signing.asm.js',
      ...nextPkg.files.filter(file => file !== 'cardano_message_signing_bg.wasm')
    ];
  }

  nextPkg.repository = {
    type: "git",
    url: "git+https://github.com/yoroi-classic/message-signing.git"
  };
  nextPkg.author = "Yoroi Classic Contributors";
  nextPkg.license = "MIT";

  return nextPkg;
}

function main() {
  const pkg = require('../publish/package.json');
  const nextPkg = updatePackage(pkg, process.argv.slice(2));
  console.log(nextPkg);
  fs.writeFileSync('./publish/package.json', JSON.stringify(nextPkg, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = {
  updatePackage,
};
