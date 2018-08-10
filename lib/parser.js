function getBlocks (lines) {
    const blocks = [];

    let open = null;

    let content = [];

    const append = (cur) => {
        content.push(cur.replace(/\s{2}(.*)/, '$1'));
    }

    const close = () => {
        if (open !== null) {
            blocks.push({
                signature: open,
                content: content,
            });
        }

        open = null;
        content = [];
    }

    for (let x = 0; x < lines.length; x += 1) {
        const cur = lines[x];

        if (open === null) {
            open = cur;
            continue;
        }

        if (cur.match(/^\s+.*/)) {
            append(cur);
        } else {
            close();
            open = cur;
        }
    }

    close();

    return blocks.map(cur => {
        if (cur.content.filter(c => c.match(/^([A-Z]+).*/)).length > 0) {
            cur.content = getBlocks(cur.content);
        }

        return cur;
    });
}

module.exports.getBlocks = getBlocks;


const blocks = [
    require('./blocks/env.js'),
    require('./blocks/request.js'),
    require('./blocks/with.js'),
    require('./blocks/callback.js'),
    require('./blocks/describe.js'),
    require('./blocks/discuss.js'),
    require('./blocks/skip.js'),
    require('./blocks/include.js')
]

function getCompiler (block) {
    const len = blocks.length;

    for (let i = 0; i < len; i += 1) {
        let cur = blocks[i];
        let verbs = cur.verb instanceof Array ? cur.verb : [cur.verb];

        for (let x = 0; x < verbs.length; x += 1) {
            let verb = verbs[x];

            if (block.signature.indexOf(verb) === 0) {
                return cur.compiler;
            }
        }
    }

    return null;
}

function compile (block) {
    const compiler = getCompiler(block);

    if (compiler) {
        return compiler(block);
    } else {
        throw new Error(`Invalid block "${block.signature}"`);
    }
}

module.exports.compile = compile;