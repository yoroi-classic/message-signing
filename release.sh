echo "Preparing local release artifacts"

. ./build-and-test.sh \
&& npm run js:pack-nodejs:no-gc \
&& npm run js:pack-browser:no-gc \
&& npm run js:pack-asm:no-gc \
&& npm run js:pack-nodejs:gc \
&& npm run js:pack-browser:gc \
&& npm run js:pack-asm:gc \
&& npm run rust:package
