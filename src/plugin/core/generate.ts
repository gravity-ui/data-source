import path from 'node:path';

import MagicString from 'magic-string';
import type {ImportDeclaration} from 'oxc-parser';
import type {JsxOptions} from 'oxc-transform';
import {transformSync} from 'oxc-transform';

import type {HocInfo} from './extract';
import {COMPANION_TYPES, makeCompanionId, stripQuery} from './utils';

export interface GenerateOptions {
    jsx?: JsxOptions;
    target?: string | string[];
}

export interface SourceWithMap {
    code: string;
    map: string;
}

export function generateAuxModule(
    sourceFile: string,
    info: HocInfo,
    type: 'loading' | 'error',
    options: GenerateOptions = {},
): SourceWithMap {
    const auxInfo = info[type];
    const name = info.exportedName;
    const suffix = COMPANION_TYPES[type];
    const cleanSourceFile = stripQuery(sourceFile);

    const code = [
        renderImports(auxInfo.imports),
        '',
        `export const ${name}${suffix} = ${auxInfo.argSource};`,
        '',
    ]
        .join('\n')
        .trimStart();

    return transformJsx(makeCompanionId(type, cleanSourceFile), code, options);
}

export function generateLazyModule(
    sourceFile: string,
    info: HocInfo,
    options: GenerateOptions = {},
): SourceWithMap {
    const importSource = options.jsx?.importSource ?? 'react';

    const name = info.exportedName;
    const cleanSourceFile = stripQuery(sourceFile);
    const base = `./${path.basename(cleanSourceFile, path.extname(cleanSourceFile))}`;

    const code = [
        `import {lazy} from '${importSource}';`,
        '',
        info.hocImportedName === 'default'
            ? `import ${info.hocLocalName} from '${info.hocImportSource}';`
            : `import {${info.hocImportedName}} from '${info.hocImportSource}';`,
        '',
        `import {${name}Loading} from '${base}.Loading';`,
        `import {${name}Error} from '${base}.Error';`,
        ``,
        `export const ${name}Lazy = ${info.hocImportedName === 'default' ? info.hocLocalName : info.hocImportedName}(`,
        `    lazy(() => import('${base}').then((m) => ({default: m.${name}Content}))),`,
        `    ${name}Loading,`,
        `    ${name}Error,`,
        `);`,
        ``,
    ].join('\n');

    const filename = makeCompanionId('lazy', cleanSourceFile);
    const map = new MagicString(code).generateMap({
        source: filename,
        includeContent: true,
        hires: false,
    });

    return {code, map: map.toString()};
}

function transformJsx(filename: string, code: string, options: GenerateOptions): SourceWithMap {
    const result = transformSync(filename, code, {
        lang: 'tsx',
        jsx: options.jsx,
        target: options.target,
        sourcemap: true,
    });

    if (result.errors.length > 0) {
        const error = result.errors[0];
        throw new Error(error.codeframe ?? error.message);
    }

    return {code: result.code, map: JSON.stringify(result.map)};
}

function renderImport(decl: ImportDeclaration): string {
    const parts: string[] = [];
    const named: string[] = [];

    for (const spec of decl.specifiers) {
        if (spec.type === 'ImportDefaultSpecifier') {
            parts.push(spec.local.name);
        } else if (spec.type === 'ImportNamespaceSpecifier') {
            parts.push(`* as ${spec.local.name}`);
        } else {
            const imported =
                spec.imported.type === 'Literal'
                    ? JSON.stringify(spec.imported.value)
                    : spec.imported.name;
            const renderedSpec =
                imported === spec.local.name
                    ? spec.local.name
                    : `${imported} as ${spec.local.name}`;
            named.push(spec.importKind === 'type' ? `type ${renderedSpec}` : renderedSpec);
        }
    }

    if (named.length > 0) {
        parts.push(`{${named.join(', ')}}`);
    }

    return `import ${decl.importKind === 'type' ? 'type ' : ''}${parts.join(', ')} from '${decl.source.value}';`;
}

function renderImports(imports: ImportDeclaration[]): string {
    return imports.map(renderImport).join('\n');
}
