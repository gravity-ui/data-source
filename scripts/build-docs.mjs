// Builds the AI-facing docs INDEX into build/docs so an agent in a consumer project reads
// the package overview (positioning + when-to-use from the README's For AI agents block)
// matching the installed version, from node_modules/@gravity-ui/data-source/build/docs.
// Appended to the build npm script. No docs/ guides or per-component READMEs exist yet,
// so only INDEX.md is generated; add sources here when guides land.
// Uses @gravity-ui/readme-validator's buildDocs().
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {buildDocs} from '@gravity-ui/readme-validator';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

buildDocs({
    rootDir: ROOT,
    outDir: path.join(ROOT, 'build', 'docs'),
    sources: [],
});
