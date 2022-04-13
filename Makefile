pulchra-wasm.js: pulchra/*.c pulchra/*.h pulchra/sds/*.c pulchra/sds/*.h
	emcc -std=c11 -Os pulchra/pulchra.c pulchra/pulchra_data.c pulchra/sds/sds.c -s EXPORTED_RUNTIME_METHODS=ccall,UTF8ToString -s FILESYSTEM=0 -s ENVIRONMENT=web -s MODULARIZE=1 -s EXPORT_ES6=1 -s 'EXPORT_NAME="createPulchra"' -s SINGLE_FILE=0 -s ASSERTIONS=0 -o pulchra-wasm.js
clean:
	rm -f pulchra-wasm.js pulchra-wasm.wasm
