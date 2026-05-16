import path from 'node:path';

export const VIRTUAL_PREFIX = '\0dsl-plugin';

export const COMPANION_TYPES = {
    loading: 'Loading',
    error: 'Error',
    lazy: 'Lazy',
} as const;

export type CompanionType = keyof typeof COMPANION_TYPES;
export type CompanionSuffix = (typeof COMPANION_TYPES)[CompanionType];

export const COMPANION_TYPE_BY_SUFFIX: Record<CompanionSuffix, CompanionType> = {
    Loading: 'loading',
    Error: 'error',
    Lazy: 'lazy',
};

export const COMPANION_TYPES_SET = new Set(Object.keys(COMPANION_TYPES) as CompanionType[]);
export const COMPANION_SUFFIXES_SET = new Set(Object.values(COMPANION_TYPES) as CompanionSuffix[]);

export function isCompanionType(type: string): type is CompanionType {
    return COMPANION_TYPES_SET.has(type as CompanionType);
}

export function isCompanionSuffix(suffix: string): suffix is CompanionSuffix {
    return COMPANION_SUFFIXES_SET.has(suffix as CompanionSuffix);
}

export function makeVirtualId(type: CompanionType, sourceFile: string): string {
    return `${VIRTUAL_PREFIX}:${type}:${sourceFile}`;
}

export function parseVirtualId(id: string): {type: CompanionType; sourceFile: string} | null {
    const prefixIndex = id.indexOf(VIRTUAL_PREFIX);

    if (prefixIndex === -1) {
        return null;
    }

    const rest = id.slice(prefixIndex + VIRTUAL_PREFIX.length + 1);
    const colonIndex = rest.indexOf(':');

    if (colonIndex === -1) {
        return null;
    }

    const type = rest.slice(0, colonIndex);

    if (!isCompanionType(type)) {
        return null;
    }

    return {type, sourceFile: rest.slice(colonIndex + 1)};
}

// TODO(DakEnviy, plugin): Think about imports like './Foo.test'
export function makeCompanionId(type: CompanionType, sourceFile: string): string {
    const suffix = COMPANION_TYPES[type];
    const ext = path.extname(sourceFile);
    const base = ext ? sourceFile.slice(0, -ext.length) : sourceFile;
    return `${base}.${suffix}${ext}`;
}

export function parseCompanionId(id: string): {type: CompanionType; sourceFile: string} | null {
    const suffixIndex = id.lastIndexOf('.');

    if (suffixIndex === -1) {
        return null;
    }

    const suffix = id.slice(suffixIndex + 1);

    if (!isCompanionSuffix(suffix)) {
        return null;
    }

    return {type: COMPANION_TYPE_BY_SUFFIX[suffix], sourceFile: id.slice(0, suffixIndex)};
}

export function isRelativeId(id: string): boolean {
    return id[0] === '.';
}

export function stripQuery(id: string): string {
    const queryIndex = id.indexOf('?');
    return queryIndex === -1 ? id : id.slice(0, queryIndex);
}

export function getHocString(from: string, name: string): string {
    return `${from}/${name}`;
}

export function assertNever(value: never): never {
    throw new Error(`Unexpected value: ${value}`);
}
