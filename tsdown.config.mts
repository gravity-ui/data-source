import {copyFile, mkdir} from 'node:fs/promises';
import path from 'node:path';

import {defineConfig} from 'tsdown';

export default defineConfig({
    entry: ['src/plugin/*.ts'],
    outDir: 'build/plugin',
    dts: true,
    deps: {
        skipNodeModulesBundle: true,
    },
    hooks: {
        'build:done': async () => {
            const dest = path.resolve('build/plugin/typings/client.d.ts');
            await mkdir(path.dirname(dest), {recursive: true});
            await copyFile('src/plugin/typings/client.d.ts', dest);
        },
    },
});
