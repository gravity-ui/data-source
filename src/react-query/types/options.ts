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
    /** Normalization configuration (enable/disable) */
    normalize?: boolean;
    /** Optimistic data update configuration */
    optimistic?: boolean | OptimisticConfig;
    /** Invalidate data configuration */
    invalidate?: boolean;
}
