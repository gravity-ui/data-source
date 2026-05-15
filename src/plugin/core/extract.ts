import type {ImportDeclaration, JSXIdentifier, Program} from 'oxc-parser';
import {Visitor, parseSync} from 'oxc-parser';

import type {CompanionSuffix} from './utils';
import {COMPANION_TYPES, getHocString, isCompanionSuffix} from './utils';

export interface AuxInfo {
    argSource: string;
    argStart: number;
    argEnd: number;
    imports: ImportDeclaration[];
}

export type ContentInfo =
    | {kind: 'identifier'; name: string}
    | {kind: 'inline'; argSource: string; argStart: number; argEnd: number};

export interface HocInfo {
    hocImportSource: string;
    hocImportedName: string;
    hocLocalName: string;
    exportedName: string;
    hocExportStart: number;
    content: ContentInfo;
    loading: AuxInfo;
    error: AuxInfo;
}

// eslint-disable-next-line complexity
export function extractHocInfo(
    hocsSet: Set<string>,
    filename: string,
    source: string,
): HocInfo | null {
    const program = parseProgram(filename, source);
    if (!program) {
        return null;
    }

    const importDecls: ImportDeclaration[] = [];
    const trackedHocs = new Map<string, {from: string; name: string}>();

    for (const node of program.body) {
        if (node.type !== 'ImportDeclaration' || node.importKind === 'type') {
            continue;
        }

        importDecls.push(node);

        for (const spec of node.specifiers) {
            let importedName: string;

            if (spec.type === 'ImportSpecifier') {
                if (spec.importKind === 'type') {
                    continue;
                }
                importedName =
                    spec.imported.type === 'Literal' ? spec.imported.value : spec.imported.name;
            } else if (spec.type === 'ImportDefaultSpecifier') {
                importedName = 'default';
            } else {
                // TODO(DakEnviy, plugin): Support namespace HOC calls (DS.withAsyncBoundary)
                continue;
            }

            if (hocsSet.has(getHocString(node.source.value, importedName))) {
                trackedHocs.set(spec.local.name, {from: node.source.value, name: importedName});
            }
        }
    }

    if (trackedHocs.size === 0) {
        return null;
    }

    // TODO(DakEnviy, plugin): Support `export { X }`, `export { X as Y }`, `export default X`, `export default hoc(...)`
    for (const node of program.body) {
        if (
            node.type !== 'ExportNamedDeclaration' ||
            node.exportKind === 'type' ||
            node.declaration?.type !== 'VariableDeclaration'
        ) {
            continue;
        }

        for (const decl of node.declaration.declarations) {
            if (
                decl.id.type !== 'Identifier' ||
                !decl.init ||
                decl.init.type !== 'CallExpression' ||
                decl.init.callee.type !== 'Identifier' ||
                decl.init.arguments.length !== 3
            ) {
                continue;
            }

            const hocEntry = trackedHocs.get(decl.init.callee.name);
            if (!hocEntry) {
                continue;
            }

            const [contentArg, loadingArg, errorArg] = decl.init.arguments;

            const contentInfo: ContentInfo =
                contentArg.type === 'Identifier'
                    ? {kind: 'identifier', name: contentArg.name}
                    : {
                          kind: 'inline',
                          argSource: source.slice(contentArg.start, contentArg.end),
                          argStart: contentArg.start,
                          argEnd: contentArg.end,
                      };

            return {
                hocImportSource: hocEntry.from,
                hocImportedName: hocEntry.name,
                hocLocalName: decl.init.callee.name,
                exportedName: decl.id.name,
                hocExportStart: node.start,
                content: contentInfo,
                loading: {
                    argSource: source.slice(loadingArg.start, loadingArg.end),
                    argStart: loadingArg.start,
                    argEnd: loadingArg.end,
                    imports: filterNeededImports(importDecls, collectIdentifiers(loadingArg)),
                },
                error: {
                    argSource: source.slice(errorArg.start, errorArg.end),
                    argStart: errorArg.start,
                    argEnd: errorArg.end,
                    imports: filterNeededImports(importDecls, collectIdentifiers(errorArg)),
                },
            };
        }
    }

    return null;
}

export interface ImportSpecifierMeta {
    localName: string;
    importedName: string;
    start: number;
    end: number;
}

export interface ImportDeclarationMeta {
    source: string;
    namedSpecifiers: ImportSpecifierMeta[];
    start: number;
    end: number;
}

export interface CompanionAccess {
    prop: CompanionSuffix;
    start: number;
    end: number;
}

export interface CompanionUsageInfo {
    decl: ImportDeclarationMeta;
    spec: ImportSpecifierMeta;
    accesses: CompanionAccess[];
    hasOtherUsages: boolean;
}

const COMPANION_PROPS_RE = new RegExp(`\\.(${Object.values(COMPANION_TYPES).join('|')})\\b`);

export function extractUsages(filename: string, source: string): CompanionUsageInfo[] {
    const result: CompanionUsageInfo[] = [];

    if (!COMPANION_PROPS_RE.test(source)) {
        return result;
    }

    const program = parseProgram(filename, source);
    if (!program) {
        return result;
    }

    const trackedImports = new Map<
        string,
        {decl: ImportDeclarationMeta; spec: ImportSpecifierMeta}
    >();
    const importLocalStarts = new Set<number>();

    for (const node of program.body) {
        if (node.type !== 'ImportDeclaration') {
            continue;
        }

        const declMeta: ImportDeclarationMeta = {
            source: node.source.value,
            namedSpecifiers: [],
            start: node.start,
            end: node.end,
        };

        for (const spec of node.specifiers) {
            if (spec.type !== 'ImportSpecifier') {
                continue;
            }

            const specMeta: ImportSpecifierMeta = {
                localName: spec.local.name,
                importedName:
                    spec.imported.type === 'Literal' ? spec.imported.value : spec.imported.name,
                start: spec.start,
                end: spec.end,
            };

            declMeta.namedSpecifiers.push(specMeta);
            trackedImports.set(spec.local.name, {decl: declMeta, spec: specMeta});
            importLocalStarts.add(spec.local.start);
        }
    }

    if (trackedImports.size === 0) {
        return result;
    }

    interface Usage {
        totalStarts: Set<number>;
        accesses: CompanionAccess[];
    }
    const usages = new Map<string, Usage>();

    function ensureUsage(name: string): Usage {
        let usage = usages.get(name);
        if (!usage) {
            usages.set(name, (usage = {totalStarts: new Set(), accesses: []}));
        }
        return usage;
    }

    function trackIdentifier(name: string, start: number): void {
        if (trackedImports.has(name) && !importLocalStarts.has(start)) {
            ensureUsage(name).totalStarts.add(start);
        }
    }

    function trackCompanionAccess(
        localName: string,
        prop: CompanionSuffix,
        exprStart: number,
        exprEnd: number,
    ): void {
        ensureUsage(localName).accesses.push({prop, start: exprStart, end: exprEnd});
    }

    new Visitor({
        Identifier(node) {
            trackIdentifier(node.name, node.start);
        },
        JSXIdentifier(node) {
            trackIdentifier(node.name, node.start);
        },
        MemberExpression(node) {
            if (
                !node.computed &&
                node.object.type === 'Identifier' &&
                trackedImports.has(node.object.name) &&
                node.property.type === 'Identifier' &&
                isCompanionSuffix(node.property.name)
            ) {
                trackCompanionAccess(node.object.name, node.property.name, node.start, node.end);
            }
        },
        JSXMemberExpression(node) {
            if (
                node.object.type === 'JSXIdentifier' &&
                trackedImports.has(node.object.name) &&
                isCompanionSuffix(node.property.name)
            ) {
                trackCompanionAccess(node.object.name, node.property.name, node.start, node.end);
            }
        },
    }).visit(program);

    for (const [localName, {accesses, totalStarts}] of usages) {
        if (accesses.length === 0) {
            continue;
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const {decl, spec} = trackedImports.get(localName)!;
        const hasOtherUsages = totalStarts.size > accesses.length;

        result.push({decl, spec, accesses, hasOtherUsages});
    }

    return result;
}

function collectIdentifiers(node: OwnNode): Set<string> {
    const result = new Set<string>();

    walk(node, (current) => {
        if (isOwnIdentifier(current) || isJSXIdentifier(current)) {
            result.add(current.name);
        }
    });

    return result;
}

function filterNeededImports(
    importDecls: ImportDeclaration[],
    identifiers: Set<string>,
): ImportDeclaration[] {
    const result: ImportDeclaration[] = [];

    for (const decl of importDecls) {
        if (decl.specifiers.length === 0) {
            result.push(decl);
            continue;
        }

        const specifiers = decl.specifiers.filter((spec) => identifiers.has(spec.local.name));
        if (specifiers.length > 0) {
            result.push({...decl, specifiers});
        }
    }

    return result;
}

interface OwnNode {
    type: string;
}

interface OwnIdentifier extends OwnNode {
    type: 'Identifier';
    name: string;
}

function isOwnNode(node: unknown): node is OwnNode {
    return (
        typeof node === 'object' && node !== null && 'type' in node && typeof node.type === 'string'
    );
}

function isOwnIdentifier(node: OwnNode): node is OwnIdentifier {
    return node.type === 'Identifier';
}

function isJSXIdentifier(node: OwnNode): node is JSXIdentifier {
    return node.type === 'JSXIdentifier';
}

function walk(node: unknown, visitor: (node: OwnNode) => void): void {
    if (!isOwnNode(node)) {
        return;
    }

    visitor(node);

    for (const value of Object.values(node) as unknown[]) {
        if (Array.isArray(value)) {
            for (const item of value as unknown[]) {
                walk(item, visitor);
            }
        } else {
            walk(value, visitor);
        }
    }
}

function parseProgram(filename: string, source: string): Program | null {
    const parsed = parseSync(filename, source, {sourceType: 'module', range: true});

    if (parsed.errors.some((error) => error.severity === 'Error')) {
        return null;
    }

    return parsed.program;
}
