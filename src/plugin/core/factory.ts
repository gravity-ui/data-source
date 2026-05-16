import fs from 'node:fs';

import MagicString from 'magic-string';
import type {UnpluginFactory} from 'unplugin';

import type {ArgInfo, CompanionAccess, CompanionUsageInfo, HocInfo, ReExports} from './extract';
import {extractHocInfo, extractReExports, extractUsages} from './extract';
import type {GenerateOptions} from './generate';
import {generateAuxModule, generateLazyModule} from './generate';
import {resolveSourceFile} from './resolve';
import type {VerifiedCompanionUsage} from './transform';
import {transformDefinitionModule, transformUsages} from './transform';
import {
    VIRTUAL_PREFIX,
    assertNever,
    getHocString,
    isRelativeId,
    makeVirtualId,
    parseCompanionId,
    parseVirtualId,
    stripQuery,
} from './utils';

export interface DataSourceLazyHocPattern {
    from: string;
    name: string;
}

export interface DataSourceLazyPluginOptions {
    hocs?: DataSourceLazyHocPattern[];
    include?: RegExp | RegExp[];
    exclude?: RegExp | RegExp[];
    generateOptions?: GenerateOptions;
}

export const DEFAULT_HOCS: DataSourceLazyPluginOptions['hocs'] = [
    {from: '@gravity-ui/data-source', name: 'withAsyncBoundary'},
    {from: '@gravity-ui/data-source', name: 'withQueryAsyncBoundary'},
];

export const DEFAULT_INCLUDE = /\.(tsx?|jsx?)$/;

const VIRTUAL_EXCLUDE = new RegExp(`${VIRTUAL_PREFIX}|${encodeURIComponent(VIRTUAL_PREFIX)}`);

export const dataSourceLazyUnpluginFactory: UnpluginFactory<
    DataSourceLazyPluginOptions | undefined
> = (options = {}) => {
    const hocPatterns = options.hocs ?? DEFAULT_HOCS;
    const include = options.include ?? DEFAULT_INCLUDE;
    const exclude = [VIRTUAL_EXCLUDE];

    if (Array.isArray(options.exclude)) {
        exclude.push(...options.exclude);
    } else if (options.exclude) {
        exclude.push(options.exclude);
    }

    const hocsSet = new Set(hocPatterns.map((pattern) => getHocString(pattern.from, pattern.name)));
    const hocsRegexp = new RegExp(
        Array.from(new Set(hocPatterns.map((pattern) => pattern.name)))
            .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('|'),
    );

    const hocInfoCache = new Map<string, HocInfo | null>();
    const reExportsCache = new Map<string, ReExports>();

    const getHocInfo = (sourceFile: string, source?: string): HocInfo | null => {
        const key = stripQuery(sourceFile);

        const cachedInfo = hocInfoCache.get(key);
        if (cachedInfo !== undefined) {
            return cachedInfo;
        }

        const resolvedSource = source ?? fs.readFileSync(key, 'utf-8');
        const info = hocsRegexp.test(resolvedSource)
            ? extractHocInfo(hocsSet, key, resolvedSource)
            : null;

        hocInfoCache.set(key, info);
        return info;
    };

    const getReExports = (sourceFile: string, source?: string): ReExports => {
        const key = stripQuery(sourceFile);

        const cachedReExports = reExportsCache.get(key);
        if (cachedReExports) {
            return cachedReExports;
        }

        const resolvedSource = source ?? fs.readFileSync(key, 'utf-8');
        const reExports = extractReExports(key, resolvedSource);

        reExportsCache.set(key, reExports);
        return reExports;
    };

    return {
        name: 'data-source-lazy',
        enforce: 'pre',

        async resolveId(id, importer) {
            if (!importer) {
                return null;
            }

            const companion = parseCompanionId(id);
            const parsedImporter = parseVirtualId(importer);
            const normalizedImporter = parsedImporter?.sourceFile ?? importer;

            if (companion) {
                const resolvedId = await resolveSourceFile(this, id, normalizedImporter);
                if (resolvedId) {
                    return null;
                }

                const resolvedSourceFile = await resolveSourceFile(
                    this,
                    companion.sourceFile,
                    normalizedImporter,
                );

                return resolvedSourceFile && makeVirtualId(companion.type, resolvedSourceFile);
            }

            if (parsedImporter && isRelativeId(id)) {
                return resolveSourceFile(this, id, parsedImporter.sourceFile);
            }

            return null;
        },

        load: {
            filter: {id: new RegExp(VIRTUAL_PREFIX)},
            handler(id) {
                const parsedId = parseVirtualId(id);
                if (!parsedId) {
                    return null;
                }

                this.addWatchFile(parsedId.sourceFile);

                const info = getHocInfo(parsedId.sourceFile);
                if (!info) {
                    return null;
                }

                switch (parsedId.type) {
                    case 'loading':
                    case 'error':
                        return generateAuxModule(
                            parsedId.sourceFile,
                            info,
                            parsedId.type,
                            options.generateOptions,
                        );
                    case 'lazy':
                        return generateLazyModule(
                            parsedId.sourceFile,
                            info,
                            options.generateOptions,
                        );
                    default:
                        return assertNever(parsedId.type);
                }
            },
        },

        transform: {
            filter: {
                id: {include, exclude},
            },
            async handler(code, id) {
                const info = getHocInfo(id, code);
                const usages = extractUsages(id, code);

                if (!info && usages.length === 0) {
                    return null;
                }

                const filteredUsages = info ? dropAccessesInsideHocArgs(info, usages) : usages;

                const resolveHocSourceFile = async (
                    file: string,
                    importedName: string,
                    visited: Set<string> = new Set(),
                ): Promise<{file: string; info: HocInfo} | null> => {
                    const visitKey = `${file}\0${importedName}`;
                    if (visited.has(visitKey)) {
                        return null;
                    }
                    visited.add(visitKey);

                    const directInfo = getHocInfo(file);
                    if (directInfo && directInfo.exportedName === importedName) {
                        return {file, info: directInfo};
                    }

                    const reExports = getReExports(file);

                    const named = reExports.named.get(importedName);
                    if (named) {
                        const resolved = await resolveSourceFile(this, named.source, file);
                        if (resolved) {
                            const next = await resolveHocSourceFile(
                                resolved,
                                named.importedName,
                                visited,
                            );
                            if (next) {
                                return next;
                            }
                        }
                    }

                    for (const starSource of reExports.stars) {
                        const resolved = await resolveSourceFile(this, starSource, file);
                        if (!resolved) {
                            continue;
                        }
                        const next = await resolveHocSourceFile(resolved, importedName, visited);
                        if (next) {
                            return next;
                        }
                    }

                    return null;
                };

                const verifiedUsages = (
                    await Promise.all(
                        filteredUsages.map(async (usage) => {
                            const resolvedSourceFile = await resolveSourceFile(
                                this,
                                usage.decl.source,
                                id,
                            );
                            if (!resolvedSourceFile) {
                                return null;
                            }

                            const target = await resolveHocSourceFile(
                                resolvedSourceFile,
                                usage.spec.importedName,
                            );
                            if (!target) {
                                return null;
                            }

                            return {
                                usage,
                                hocSourceFile: target.file,
                                hocExportedName: target.info.exportedName,
                            };
                        }),
                    )
                ).filter((usage): usage is VerifiedCompanionUsage => usage !== null);

                if (!info && verifiedUsages.length === 0) {
                    return null;
                }

                const s = new MagicString(code);
                if (info) {
                    transformDefinitionModule(s, id, info);
                }
                if (verifiedUsages.length > 0) {
                    transformUsages(s, verifiedUsages);
                }

                if (!s.hasChanged()) {
                    return null;
                }

                return {
                    code: s.toString(),
                    map: s.generateMap({source: id, hires: true}).toString(),
                };
            },
        },

        watchChange(id) {
            const key = stripQuery(id);

            hocInfoCache.delete(key);
            reExportsCache.delete(key);
        },
    };
};

function isInside(info: ArgInfo, access: CompanionAccess): boolean {
    return info.argStart <= access.start && access.end <= info.argEnd;
}

// transformDefinitionModule overwrites HOC arg ranges wholesale (the entire arg becomes
// `${name}Loading`/`Error`/`Content`). A second overwrite of a companion access inside
// such a range would crash MagicString with "Cannot split a chunk that has already been
// edited". Drop those accesses here.
//
// hasOtherUsages stays correct without recomputation: each dropped access contributed
// exactly one entry to totalStarts (via the object Identifier visited as a child of the
// MemberExpression), so totalStarts.size - accesses.length is preserved.
function dropAccessesInsideHocArgs(
    info: HocInfo,
    usages: CompanionUsageInfo[],
): CompanionUsageInfo[] {
    const result: CompanionUsageInfo[] = [];

    for (const usage of usages) {
        const accesses = usage.accesses.filter(
            (access) =>
                !isInside(info.loading, access) &&
                !isInside(info.error, access) &&
                !(info.content.kind === 'inline' && isInside(info.content, access)),
        );

        if (accesses.length === 0) {
            continue;
        }

        if (accesses.length === usage.accesses.length) {
            result.push(usage);
            continue;
        }

        result.push({...usage, accesses});
    }

    return result;
}
