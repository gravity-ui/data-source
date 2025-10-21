import type {Data} from '@normy/core';
import type {QueryClient, QueryKey} from '@tanstack/react-query';

import type {
    DataSourceNormalizerConfig,
    Normalizer,
    OptimisticUpdateConfig,
    OptionsNormalizerConfig,
} from '../types/normalizer';
import {shouldNormalize, shouldOptimisticallyUpdate} from '../utils/normalize';

// Function to update queries in QueryClient based on normalized data
export const updateQueriesFromMutationData = (
    mutationData: Data,
    normalizer: Normalizer,
    queryClient: QueryClient,
) => {
    const queriesToUpdate = normalizer.getQueriesToUpdate(mutationData);

    queriesToUpdate.forEach((query) => {
        const queryKey = JSON.parse(query.queryKey) as QueryKey;
        const cachedQuery = queryClient.getQueryCache().find({queryKey});

        // Preserve state that should not be reset
        const dataUpdatedAt = cachedQuery?.state.dataUpdatedAt;
        const isInvalidated = cachedQuery?.state.isInvalidated;
        const error = cachedQuery?.state.error;
        const status = cachedQuery?.state.status;

        queryClient.setQueryData(queryKey, () => query.data, {
            updatedAt: dataUpdatedAt,
        });

        cachedQuery?.setState({isInvalidated, error, status});
    });
};

interface CreateQueryNormalizerOptions {
    queryClient: QueryClient;
    normalizer: Normalizer;
    normalizerConfig: DataSourceNormalizerConfig;
    optimisticUpdateConfig: OptimisticUpdateConfig;
}

export const createQueryNormalizer = ({
    queryClient,
    normalizer,
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
        setNormalizedData: (data: Data) =>
            updateQueriesFromMutationData(data, normalizer, queryClient),
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
                    !shouldOptimisticallyUpdate(globalOptimistic, mutationQueryOptimistic?.enabled)
                ) {
                    return;
                }

                if (
                    event.type === 'updated' &&
                    event.action.type === 'success' &&
                    event.action.data
                ) {
                    updateQueriesFromMutationData(
                        event.action.data as Data,
                        normalizer,
                        queryClient,
                    );
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

                        updateQueriesFromMutationData(
                            context.optimisticData,
                            normalizer,
                            queryClient,
                        );
                    }
                } else if (event.type === 'updated' && event.action.type === 'error') {
                    const context = event.mutation.state.context as {
                        rollbackData?: Data;
                    };

                    if (context?.rollbackData) {
                        if (optimisticUpdateConfig.devLogging) {
                            console.log('[OptimisticUpdate] Rolling back changes');
                        }

                        updateQueriesFromMutationData(
                            context.rollbackData,
                            normalizer,
                            queryClient,
                        );
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
