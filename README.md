# Message Signing

This is a library that implements the [CIP-0008](https://github.com/cardano-foundation/CIPs/blob/master/CIP-0008/README.md) message signing spec for the Cardano blockchain.

The library is composed of structs for (de)serializing the CBOR defined in CIP-0008/COSE which lays at the core of the protocol, mostly defined in `lib.rs`, as well as many helper utilities for more specific cases useful to CIP-0008. These are mostly in `builders.rs` for building the CBOR structures specific to certain algorithms.

##### Package artifacts

This repository builds local package artifacts under owned package names:

- `@yoroi-classic/cardano-message-signing-nodejs`
- `@yoroi-classic/cardano-message-signing-browser`
- `@yoroi-classic/cardano-message-signing-asmjs`

The project is not published to npmjs. Pin source checkouts to GitHub refs and
consume local tarballs generated from this repository.

##### Crate

- Rust crate name: `cardano-message-signing`

##### Mobile bindings 

- React-Native mobile bindings are tracked in `yoroi-classic/csl-mobile-bridge`.

## Supported toolchain

- Node.js: `22.22.2` for local and CI builds, with package metadata allowing maintained Node 22 and 24 LTS lines.
- npm: `10.9.7`, managed through the package manager metadata.
- Rust: `1.92.0`, pinned in `rust-toolchain.toml` with the `wasm32-unknown-unknown` target.
- wasm-pack: `0.15.0`, installed by `npm run setup:wasm-pack`.

## Building

It can be used from both rust or compiled to wasm as all public code works with `wasm-bindgen` via `wasm-pack`.

This repository builds local artifacts only; it does not publish npm packages or crates.

In the meantime to build a wasm package we can run one of

* `npm run rust:build-nodejs` for nodejs targeted wasm
* `npm run rust:build-browser` for browser targeted wasm
* `npm run asm:build` for conversion for asm.js

and for use from rust simply use the lib that resides in `/rust/`.

To create local JS package tarballs instead of publishing to npmjs, run one of:

* `npm run js:pack-nodejs:no-gc`
* `npm run js:pack-browser:no-gc`
* `npm run js:pack-asm:no-gc`



## Example Usage

It is important to read the CIP-0008 spec to properly understand how to use this library. As per CIP-0008/COSE, signing is done via constructing a `SigStructure` and then signing this with the proper keys. This can be simplified via the use of the `COSESignBuilder` (for multiparty signing) / `COSESign1Builder` (for single signer) builders. Encryption is not yet supported by this library but will be in the future. An example node.js (wasm option) project that signs a message with a Cardano address exists in the `/example/` directory which has detailed comments describing each step.
