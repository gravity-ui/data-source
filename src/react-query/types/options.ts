import type {DefaultError, QueryKey} from '@tanstack/react-query';

import type {OptimisticUpdateConfig, OptionsNormalizerConfig} from './normalizer';
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
}

export interface QueryCustomOptions {
    /** Normalization configuration (enable/disable) */
    normalizationConfig?: OptionsNormalizerConfig;
    /** Optimistic data update configuration */
    optimisticUpdateConfig?: OptimisticUpdateConfig;
}
