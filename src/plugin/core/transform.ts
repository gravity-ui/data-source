import path from 'node:path';

import type MagicString from 'magic-string';

import type {CompanionUsageInfo, HocInfo, ImportDeclarationMeta} from './extract';
import {COMPANION_TYPE_BY_SUFFIX, makeCompanionId, stripQuery} from './utils';

export function transformDefinitionModule(s: MagicString, filename: string, info: HocInfo): void {
    const name = info.exportedName;
    const cleanFilename = stripQuery(filename);
    const localSource = `./${path.basename(cleanFilename, path.extname(cleanFilename))}`;

    const prependImports = [
        renderNamedImport(
            `${name}Loading`,
            `${name}Loading`,
            makeCompanionId('loading', localSource),
        ),
    ];
    if (info.error) {
        prependImports.push(
            renderNamedImport(
                `${name}Error`,
                `${name}Error`,
                makeCompanionId('error', localSource),
            ),
        );
    }
    s.prepend(prependImports.join('\n') + '\n');

    s.overwrite(info.loading.argStart, info.loading.argEnd, `${name}Loading`);
    if (info.error) {
        s.overwrite(info.error.argStart, info.error.argEnd, `${name}Error`);
    }

    if (info.content.kind === 'identifier') {
        s.append(`\nexport {${info.content.name} as ${name}Content};\n`);
    } else {
        s.appendLeft(info.hocExportStart, `const ${name}Content = ${info.content.argSource};\n\n`);
        s.overwrite(info.content.argStart, info.content.argEnd, `${name}Content`);
        s.append(`\nexport {${name}Content};\n`);
    }
}

export interface VerifiedCompanionUsage {
    usage: CompanionUsageInfo;
    hocImportSource: string;
    hocExportedName: string;
}

export function transformUsages(s: MagicString, usages: VerifiedCompanionUsage[]): void {
    // 1. Replace X.Prop → XProp
    for (const {usage} of usages) {
        for (const access of usage.accesses) {
            s.overwrite(access.start, access.end, `${usage.spec.localName}${access.prop}`);
        }
    }

    // 2. Prepend companion imports
    const newImports: string[] = [];

    for (const {usage, hocImportSource, hocExportedName} of usages) {
        const propsUsed = new Set(usage.accesses.map((access) => access.prop));

        for (const prop of propsUsed) {
            newImports.push(
                renderNamedImport(
                    `${usage.spec.localName}${prop}`,
                    `${hocExportedName}${prop}`,
                    makeCompanionId(COMPANION_TYPE_BY_SUFFIX[prop], hocImportSource),
                ),
            );
        }
    }

    if (newImports.length > 0) {
        s.prepend(newImports.join('\n') + '\n');
    }

    // 3. Remove specifiers of original imports that are no longer used
    const localsByDecl = new Map<ImportDeclarationMeta, Set<string>>();

    for (const {usage} of usages) {
        if (usage.hasOtherUsages) {
            continue;
        }

        let locals = localsByDecl.get(usage.decl);
        if (!locals) {
            localsByDecl.set(usage.decl, (locals = new Set()));
        }
        locals.add(usage.spec.localName);
    }

    for (const [decl, locals] of localsByDecl) {
        removeImportSpecifiers(s, decl, locals);
    }
}

function removeImportSpecifiers(
    s: MagicString,
    decl: ImportDeclarationMeta,
    localsToRemove: Set<string>,
): void {
    const kept = decl.namedSpecifiers.filter((spec) => !localsToRemove.has(spec.localName));

    if (kept.length === 0) {
        s.remove(decl.start, s.original[decl.end] === '\n' ? decl.end + 1 : decl.end);
        return;
    }

    const firstSpec = decl.namedSpecifiers[0];
    const lastSpec = decl.namedSpecifiers[decl.namedSpecifiers.length - 1];
    const braceOpen = s.original.lastIndexOf('{', firstSpec.start);
    const braceClose = s.original.indexOf('}', lastSpec.end);

    if (braceOpen === -1 || braceClose === -1) {
        return;
    }

    const keptText = kept.map((spec) => s.original.slice(spec.start, spec.end)).join(', ');
    s.overwrite(braceOpen + 1, braceClose, keptText);
}

// TODO(DakEnviy, plugin): Try to merge with renderImport from generate
function renderNamedImport(local: string, imported: string, source: string): string {
    const specifier = local === imported ? imported : `${imported} as ${local}`;
    return `import {${specifier}} from '${source}';`;
}
