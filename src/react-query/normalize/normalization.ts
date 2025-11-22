import type {Data} from '@normy/core';
import type {QueryClient, QueryKey} from '@tanstack/react-query';

import type {Normalizer} from '../../core';
import type {
    DataSourceNormalizerConfig,
    OptimisticUpdateConfig,
    OptionsNormalizerConfig,
} from '../types/normalizer';
import {shouldNormalize, shouldUpdateOptimistically} from '../utils/normalize';

interface CreateQueryNormalizerOptions {
    queryClient: QueryClient;
    normalizer: Normalizer;
    optimisticUpdate: (mutationData: Data) => void;
    normalizerConfig: DataSourceNormalizerConfig;
    optimisticUpdateConfig: OptimisticUpdateConfig;
}

export const createQueryNormalizer = ({
    queryClient,
    normalizer,
    optimisticUpdate,
    normalizerConfig,
    optimisticUpdateConfig,
}: CreateQueryNormalizerOptions) => {
    const globalNormalize = normalizerConfig.normalize ?? false;
    // No point in updating normalized data if normalization is disabled
    const globalOptimistic = (globalNormalize && optimisticUpdateConfig.enabled) || false;

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
                const queryOptions = event.query.options as {
                    normalizationConfig?: OptionsNormalizerConfig;
                };

                const queryNormalize = queryOptions?.normalizationConfig?.normalize;

                if (!shouldNormalize(globalNormalize, queryNormalize)) {
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
                    | {
                          normalizationConfig?: OptionsNormalizerConfig;
                          optimisticUpdateConfig?: OptimisticUpdateConfig;
                      }
                    | undefined;
                const mutationQueryNormalize = mutationOptions?.normalizationConfig;
                const mutationQueryOptimistic = mutationOptions?.optimisticUpdateConfig;

                if (
                    !shouldNormalize(globalNormalize, mutationQueryNormalize?.normalize) &&
                    !shouldUpdateOptimistically(globalOptimistic, mutationQueryOptimistic?.enabled)
                ) {
                    return;
                }

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
                        // Automatic rollbackData calculation
                        if (
                            !context.rollbackData &&
                            (optimisticUpdateConfig.autoCalculateRollback !== false ||
                                mutationQueryOptimistic?.autoCalculateRollback !== false)
                        ) {
                            context.rollbackData = normalizer.getCurrentData(
                                context.optimisticData,
                            );

                            if (
                                optimisticUpdateConfig.devLogging ||
                                mutationQueryOptimistic?.devLogging
                            ) {
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
                        if (optimisticUpdateConfig.devLogging) {
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
