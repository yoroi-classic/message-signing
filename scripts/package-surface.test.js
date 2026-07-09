const assert = require('assert');
const fs = require('fs');
const path = require('path');

const target = process.argv[2];
const pkgDir = path.join(__dirname, '..', 'rust', 'pkg');

function filePath(file) {
  return path.join(pkgDir, file);
}

function read(file) {
  return fs.readFileSync(filePath(file), 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function assertFile(file) {
  assert(fs.existsSync(filePath(file)), `${file} should exist`);
}

function assertNoFile(file) {
  assert(!fs.existsSync(filePath(file)), `${file} should not exist`);
}

function assertDeclarations() {
  const dts = read('cardano_message_signing.d.ts');
  [
    'export class COSESign1',
    'export class COSESign1Builder',
    'export class HeaderMap',
    'export class Headers',
    'export class ProtectedHeaderMap',
    'export class SigStructure',
    'export class SignedMessage',
    'export enum AlgorithmId',
    'export enum SigContext',
    'export enum SignedMessageKind',
  ].forEach((declaration) => assert(dts.includes(declaration), `${declaration} missing`));
}

function bytes(values) {
  return Uint8Array.from(values);
}

function assertNodeSurface() {
  assertFile('cardano_message_signing.js');
  assertFile('cardano_message_signing_bg.wasm');
  assertFile('cardano_message_signing.d.ts');

  const pkg = readJson('package.json');
  assert.strictEqual(pkg.main, 'cardano_message_signing.js');
  assert.strictEqual(pkg.types, 'cardano_message_signing.d.ts');
  assert(pkg.files.includes('cardano_message_signing_bg.wasm'));

  const lib = require(filePath('cardano_message_signing.js'));
  [
    'AlgorithmId',
    'COSESign1',
    'COSESign1Builder',
    'HeaderMap',
    'Headers',
    'Label',
    'ProtectedHeaderMap',
    'SigContext',
    'SigStructure',
    'SignedMessage',
    'SignedMessageKind',
  ].forEach((name) => assert.notStrictEqual(lib[name], undefined, `${name} export missing`));

  const protectedHeaders = lib.HeaderMap.new();
  protectedHeaders.set_algorithm_id(lib.Label.from_algorithm_id(lib.AlgorithmId.EdDSA));
  const protectedMap = lib.ProtectedHeaderMap.new(protectedHeaders);
  const headers = lib.Headers.new(protectedMap, lib.HeaderMap.new());
  const payload = bytes([1, 2, 3, 4]);
  const signature = bytes([9, 8, 7, 6]);
  const coseSign1 = lib.COSESign1.new(headers, payload, signature);
  const signedMessage = lib.SignedMessage.new_cose_sign1(coseSign1);

  const encoded = signedMessage.to_user_facing_encoding();
  assert(encoded.startsWith('cms_'));

  const decoded = lib.SignedMessage.from_user_facing_encoding(encoded);
  assert.strictEqual(decoded.kind(), lib.SignedMessageKind.COSESIGN1);
  assert.deepStrictEqual(Array.from(decoded.as_cose_sign1().payload()), Array.from(payload));
  assert.strictEqual(decoded.to_user_facing_encoding(), encoded);

  const corruptedChecksum = encoded.slice(0, -1) + (encoded.endsWith('A') ? 'B' : 'A');
  assert.throws(() => lib.SignedMessage.from_user_facing_encoding(corruptedChecksum), /checksum/);

  const externalAad = bytes([5, 6]);
  const builder = lib.COSESign1Builder.new(headers, payload, false);
  builder.set_external_aad(externalAad);
  const builderSigningData = builder.make_data_to_sign();
  const messageSigningData = coseSign1.signed_data(externalAad);

  assert.strictEqual(messageSigningData.context(), lib.SigContext.Signature1);
  assert.deepStrictEqual(
    Array.from(messageSigningData.to_bytes()),
    Array.from(builderSigningData.to_bytes())
  );
}

function assertBrowserSurface() {
  assertFile('cardano_message_signing.js');
  assertFile('cardano_message_signing_bg.js');
  assertFile('cardano_message_signing_bg.wasm');
  assertFile('cardano_message_signing.d.ts');

  const pkg = readJson('package.json');
  assert.strictEqual(pkg.types, 'cardano_message_signing.d.ts');
  if (pkg.main != null) {
    assert.strictEqual(pkg.main, 'cardano_message_signing.js');
  }
  if (pkg.module != null) {
    assert.strictEqual(pkg.module, 'cardano_message_signing.js');
  }
  assert(pkg.files.includes('cardano_message_signing.js'));
  assert(pkg.files.includes('cardano_message_signing_bg.js'));
  assert(pkg.files.includes('cardano_message_signing_bg.wasm'));

  const loader = read('cardano_message_signing.js');
  assert(loader.includes('import * as wasm from "./cardano_message_signing_bg.wasm";'));
  assert(loader.includes('export * from "./cardano_message_signing_bg.js";'));

  const bindings = read('cardano_message_signing_bg.js');
  assert(bindings.includes('export function __wbg_set_wasm'));
  assert(bindings.includes('export class COSESign1'));
  assert(bindings.includes('export class COSESign1Builder'));
  assert(bindings.includes('export class SignedMessage'));
}

function assertAsmSurface() {
  assertFile('cardano_message_signing.js');
  assertFile('cardano_message_signing_bg.js');
  assertFile('cardano_message_signing.asm.js');
  assertFile('cardano_message_signing.d.ts');
  assertNoFile('cardano_message_signing_bg.wasm');

  const loader = read('cardano_message_signing.js');
  assert(loader.includes('cardano_message_signing.asm.js'));
  assert(!loader.includes('cardano_message_signing_bg.wasm'));

  const bindings = read('cardano_message_signing_bg.js');
  assert(bindings.includes('buffer !== wasm.memory.buffer'));
  assert(!bindings.includes('cardano_message_signing_bg.wasm'));
}

if (target === 'nodejs') {
  assertNodeSurface();
} else if (target === 'browser') {
  assertBrowserSurface();
} else if (target === 'asmjs') {
  assertAsmSurface();
} else {
  throw new Error('Usage: node scripts/package-surface.test.js <nodejs|browser|asmjs>');
}

assertDeclarations();
