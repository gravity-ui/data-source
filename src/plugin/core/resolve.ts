import path from 'node:path';

import type {
    RspackCompiler,
    UnpluginBuildContext,
    UnpluginContext,
    WebpackCompiler,
} from 'unplugin';

export async function resolveSourceFile(
    ctx: UnpluginBuildContext & UnpluginContext,
    sourceFile: string,
    importer: string,
): Promise<string | null> {
    const nativeCtx = ctx.getNativeBuildContext?.();
    const directory = path.dirname(importer);

    if (nativeCtx?.framework === 'webpack' || nativeCtx?.framework === 'rspack') {
        return resolveWithCompiler(nativeCtx.compiler, directory, sourceFile);
    }

    if (nativeCtx?.framework === 'esbuild') {
        const result = await nativeCtx.build.resolve(sourceFile, {
            kind: 'import-statement',
            importer,
            resolveDir: directory,
        });

        return result.errors.length === 0 && result.path ? result.path : null;
    }

    // For Vite and Rollup, use the native resolve function
    if ('resolve' in ctx && typeof ctx.resolve === 'function') {
        const resolved = await ctx.resolve(sourceFile, importer, {skipSelf: true});

        if (!resolved || resolved.external) {
            return null;
        }

        return resolved.id;
    }

    return null;
}

function resolveWithCompiler(
    compiler: WebpackCompiler | RspackCompiler,
    directory: string,
    request: string,
): Promise<string | null> {
    return new Promise((resolve) => {
        try {
            compiler.resolverFactory
                .get('normal')
                .resolve({}, directory, request, {}, (error, result) => {
                    resolve(!error && typeof result === 'string' ? result : null);
                });
        } catch {
            resolve(null);
        }
    });
}
