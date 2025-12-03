import type {Data} from '@normy/core';
import type {QueryClient, QueryKey} from '@tanstack/react-query';

import type {Normalizer, NormalizerConfig, OptimisticConfig} from '../../core/types/Normalizer';
import type {QueryDataAdditionalOptions} from '../types/options';

interface QueryNormalizeOptions {
    normalize?: boolean;
    optimistic?: boolean | OptimisticConfig;
    invalidate?: boolean;
}

const shouldInvalidateData = (globalConfig?: boolean, mutationConfig?: boolean): boolean => {
    if (mutationConfig === false) {
        return false;
    }

    if (!globalConfig) {
        return false;
    }

    return true;
};

const shouldUpdateOptimistically = (
    globalConfig?: boolean | OptimisticConfig,
    mutationConfig?: boolean | OptimisticConfig,
): boolean => {
    if (mutationConfig === false) {
        return false;
    }

    if (
        (typeof mutationConfig === 'boolean' && mutationConfig) ||
        (typeof mutationConfig === 'object' && mutationConfig)
    ) {
        return true;
    }

    if (!globalConfig) {
        return false;
    }

    return true;
};

const getOptimisticProps = (
    globalConfig?: boolean | OptimisticConfig,
    mutationConfig?: boolean | OptimisticConfig,
) => {
    const globalAutoRollback =
        typeof globalConfig === 'object' ? globalConfig.autoCalculateRollback : undefined;
    const mutationAutoRollback =
        typeof mutationConfig === 'object' ? mutationConfig.autoCalculateRollback : undefined;
    const globalDevLogging = typeof globalConfig === 'object' ? globalConfig.devLogging : undefined;
    const mutationDevLogging =
        typeof mutationConfig === 'object' ? mutationConfig.devLogging : undefined;

    return {
        autoRollback: mutationAutoRollback ?? globalAutoRollback,
        devLogging: mutationDevLogging ?? globalDevLogging,
    };
};

export const createQueryNormalizer = (
    normalizer: Normalizer | undefined,
    queryClient: QueryClient,
    config: boolean | NormalizerConfig | undefined,
    optimisticUpdate: (mutationData: Data) => void,
    invalidateData: (data: Data) => void,
) => {
    if (!normalizer || !config) {
        return undefined;
    }

    const globalOptimistic =
        typeof config === 'object' && 'optimistic' in config ? config.optimistic : false;

    const globalInvalidateData =
        typeof config === 'object' && 'invalidate' in config ? config.invalidate : false;

    let unsubscribeQueryCache: (() => void) | null = null;
    let unsubscribeMutationCache: (() => void) | null = null;

    return {
        /** Get normalized data */
        getNormalizedData: normalizer.getNormalizedData,
        /** Set normalized data (for manual updates, WebSocket, etc.) */
        setNormalizedData: (data: Data) => optimisticUpdate(data),
        /** Clear all normalized data */
        clear: normalizer.clearNormalizedData,
        /** Get object by ID */
        getObjectById: normalizer.getObjectById,
        /** Get query fragment */
        getQueryFragment: normalizer.getQueryFragment,
        /** Get dependent queries by data */
        getDependentQueries: (mutationData: Data) =>
            normalizer.getDependentQueries(mutationData).map((key) => JSON.parse(key) as QueryKey),
        /** Get dependent queries by IDs */
        getDependentQueriesByIds: (ids: ReadonlyArray<string>) =>
            normalizer.getDependentQueriesByIds(ids).map((key) => JSON.parse(key) as QueryKey),
        /** Subscribe to QueryCache changes */
        subscribe: () => {
            // Subscribe to QueryCache (query additions/updates/removals)
            unsubscribeQueryCache = queryClient.getQueryCache().subscribe((event) => {
                const queryKeyStr = JSON.stringify(event.query.queryKey);

                if (event.type === 'removed') {
                    normalizer.removeQuery(queryKeyStr);

                    return;
                }

                // Check if the query should be normalized
                // At this point options are already merged (DataSource + Hook)
                const queryOptions = event.query.options as QueryDataAdditionalOptions;

                const queryNormalize = queryOptions?.normalize ?? true;

                if (!queryNormalize) {
                    return;
                }

                if (event.type === 'added' && event.query.state.data !== undefined) {
                    normalizer.setQuery(queryKeyStr, event.query.state.data as Data);
                } else if (
                    event.type === 'updated' &&
                    event.action.type === 'success' &&
                    event.action.data !== undefined
                ) {
                    normalizer.setQuery(queryKeyStr, event.action.data as Data);
                }
            });

            // Subscribe to MutationCache for normalization + optimistic updates
            unsubscribeMutationCache = queryClient.getMutationCache().subscribe((event) => {
                // Cast to extended type with additional configs, if available
                const mutationOptions = event.mutation?.options as
                    | QueryNormalizeOptions
                    | undefined;

                const mutationQueryNormalize = mutationOptions?.normalize;
                const mutationQueryOptimistic = mutationOptions?.optimistic;
                const mutationQueryInvalidateData = mutationOptions?.invalidate;

                if (shouldInvalidateData(globalInvalidateData, mutationQueryInvalidateData)) {
                    if (
                        event.type === 'updated' &&
                        event.action.type === 'success' &&
                        event.action.data
                    ) {
                        invalidateData(event.action.data as Data);
                    }
                }

                if (
                    !mutationQueryNormalize ||
                    !shouldUpdateOptimistically(globalOptimistic, mutationQueryOptimistic)
                ) {
                    return;
                }

                const {autoRollback, devLogging} = getOptimisticProps(
                    globalOptimistic,
                    mutationQueryOptimistic,
                );

                if (
                    event.type === 'updated' &&
                    event.action.type === 'success' &&
                    event.action.data
                ) {
                    optimisticUpdate(event.action.data as Data);
                } else if (event.type === 'updated' && event.action.type === 'pending') {
                    const context = event.mutation.state.context as {
                        optimisticData?: Data;
                        rollbackData?: Data;
                    };

                    if (context?.optimisticData) {
                        if (
                            !context.rollbackData &&
                            mutationQueryOptimistic &&
                            autoRollback !== false
                        ) {
                            context.rollbackData = normalizer.getCurrentData(
                                context.optimisticData,
                            );

                            if (devLogging) {
                                console.log(
                                    '[OptimisticUpdate] Auto-calculated rollbackData:',
                                    context.rollbackData,
                                );
                            }
                        }

                        optimisticUpdate(context.optimisticData);
                    }
                } else if (event.type === 'updated' && event.action.type === 'error') {
                    const context = event.mutation.state.context as {
                        rollbackData?: Data;
                    };

                    if (context?.rollbackData) {
                        if (devLogging) {
                            console.log('[OptimisticUpdate] Rolling back changes');
                        }

                        optimisticUpdate(context.rollbackData);
                    }
                }
            });
        },
        unsubscribe: () => {
            unsubscribeQueryCache?.();
            unsubscribeMutationCache?.();
            unsubscribeQueryCache = null;
            unsubscribeMutationCache = null;
        },
    };
};
