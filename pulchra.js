import { default as createPulchra } from './pulchra-wasm'
import pulchraWasm from './pulchra-wasm.wasm';

function pulchra(pdb) {
    return new Promise(resolve => {
        createPulchra({
            locateFile: () => pulchraWasm
        }).then((instance) => {
            const ptr = instance.ccall(
                'pulchra',
                'number',
                ['string'],
                [pdb]
            );
            const res = instance.UTF8ToString(ptr);
            instance.ccall(
                'pulchra_free',
                'number',
                ['number'],
                [ptr]
            );
            resolve(res);
        });
    })
}

export { pulchra };

