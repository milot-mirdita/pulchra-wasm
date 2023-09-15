import { default as createPulchra } from './pulchra-wasm.js'
import pulchraWasm from './pulchra-wasm.wasm';

function replaceNonStandardResidues(pdbString) {
    const standardResidues = new Set([
        "ALA", "ARG", "ASN", "ASP", "CYS",
        "GLU", "GLN", "GLY", "HIS", "ILE",
        "LEU", "LYS", "MET", "PHE", "PRO",
        "SER", "THR", "TRP", "TYR", "VAL"
    ]);

    let replacementMap = new Map();
    let lines = pdbString.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("ATOM")) {
            let residueName = lines[i].substring(17, 20).trim();
            let residueIndex = parseInt(lines[i].substring(22, 26).trim());

            // Only create mapping once for a given residue index
            if (!standardResidues.has(residueName) && !replacementMap.has(residueIndex)) {
                replacementMap.set(residueIndex, residueName);
            }
            if (replacementMap.has(residueIndex)) {
                lines[i] = lines[i].substring(0, 17) + "ALA" + lines[i].substring(20);
            }
        }
    }
    let modifiedPdbString = lines.join('\n');
    return {
        modifiedPdbString,
        replacementMap
    };
}

function restoreOriginalPDB(modifiedPdbString, replacementMap) {
    let lines = modifiedPdbString.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("ATOM")) {
            let residueIndex = parseInt(lines[i].substring(22, 26).trim());
            if (replacementMap.has(residueIndex)) {
                let originalResidueName = replacementMap.get(residueIndex);
                lines[i] = lines[i].substring(0, 17) + originalResidueName + lines[i].substring(20);
            }
        }
    }
    return lines.join('\n');
}

function pulchra(pdb) {
    return new Promise(resolve => {
        createPulchra({
            locateFile: () => pulchraWasm
        }).then((instance) => {
            let { modifiedPdbString, replacementMap } = replaceNonStandardResidues(pdb);
            const bytes = instance.lengthBytesUTF8(modifiedPdbString) + 1; // +1 for the null terminator
            const inPtr = instance._malloc(bytes);
            instance.stringToUTF8(modifiedPdbString, inPtr, bytes);
            const ptr = instance.ccall(
                'pulchra',
                'number',
                ['number'],
                [inPtr]
            );
            const res = instance.UTF8ToString(ptr);
            instance.ccall(
                'pulchra_free',
                'number',
                ['number'],
                [ptr]
            );
            instance._free(inPtr);
            resolve(restoreOriginalPDB(res, replacementMap));
        });
    })
}

export { pulchra };

