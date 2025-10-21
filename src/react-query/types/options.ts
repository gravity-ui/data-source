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
    /** Конфигурация нормализации (включение/выключение) */
    normalizationConfig?: OptionsNormalizerConfig;
    /** Конфигурация оптимистического обновления данных */
    optimisticUpdateConfig?: OptimisticUpdateConfig;
    /**
     * @deprecated The use of the enabled option is deprecated.
     * It is recommended to use idle as query parameters to control query state.
     */
    enabled?: boolean;
}
