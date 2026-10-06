import type {DefaultError, QueryKey} from '@tanstack/react-query';

import type {OptimisticConfig} from '../../core/types/Normalizer';

import type {RefetchInterval} from './refetch-interval';

export interface QueryDataAdditionalOptions<
    TQueryFnData = unknown,
    TError = DefaultError,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
> {
    refetchInterval?: RefetchInterval<TQueryFnData, TError, TQueryData, TQueryKey>;
    /**
     * @deprecated The use of the enabled option is deprecated.
     * It is recommended to use idle as query parameters to control query state.
     */
    enabled?: boolean;
    /** Normalization configuration (enable/disable) */
    normalize?: boolean;
    /** Optimistic data update configuration */
    optimistic?: boolean | OptimisticConfig;
    /** Invalidate data configuration */
    invalidate?: boolean;
    /**
     * Keeps the error already shown while the failed query is being retried, instead of
     * falling back to the loading state. Applies to a query that has no data yet: react-query
     * resets such a query to `pending` on every retry, so an interval, a window focus or a
     * reconnect makes the error view blink. An explicit `refetch` still shows loading.
     */
    keepPreviousError?: boolean;
}
