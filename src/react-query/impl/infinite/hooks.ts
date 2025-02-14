import {useMemo} from 'react';

import {useInfiniteQuery} from '@tanstack/react-query';
import type {InfiniteData, InfiniteQueryObserverOptions} from '@tanstack/react-query';

import type {
    DataSourceContext,
    DataSourceData,
    DataSourceError,
    DataSourceKey,
    DataSourceOptions,
    DataSourceParams,
    DataSourceResponse,
    DataSourceState,
} from '../../../core';
import {useRefetchInterval} from '../../hooks/useRefetchInterval';
import {normalizeStatus} from '../../utils/normalizeStatus';

import type {
    AnyInfiniteQueryDataSource,
    AnyPageParam,
    InfiniteQueryObserverExtendedOptions,
} from './types';
import {composeOptions} from './utils';

export const useInfiniteQueryData = <TDataSource extends AnyInfiniteQueryDataSource>(
    context: DataSourceContext<TDataSource>,
    dataSource: TDataSource,
    params: DataSourceParams<TDataSource>,
    extendedOptions?: Partial<DataSourceOptions<TDataSource>>,
): DataSourceState<TDataSource> => {
    const composedOptions = composeOptions(context, dataSource, params, extendedOptions);

    const options = useInfiniteQueryDataOptions(composedOptions);

    const result = useInfiniteQuery(options);

    const transformedData = useMemo<DataSourceState<TDataSource>['data']>(
        () => result.data?.pages.flat(1) ?? [],
        [result.data],
    );

    return {
        ...result,
        status: normalizeStatus(result.status, result.fetchStatus),
        data: transformedData,
        originalStatus: result.status,
        originalData: result.data,
    } as DataSourceState<TDataSource>;
};

export function useInfiniteQueryDataOptions<TDataSource extends AnyInfiniteQueryDataSource>(
    composedOptions: InfiniteQueryObserverExtendedOptions<
        DataSourceResponse<TDataSource>,
        DataSourceError<TDataSource>,
        InfiniteData<DataSourceData<TDataSource>, AnyPageParam>,
        DataSourceResponse<TDataSource>,
        DataSourceKey,
        AnyPageParam
    >,
): InfiniteQueryObserverOptions<
    DataSourceResponse<TDataSource>,
    DataSourceError<TDataSource>,
    InfiniteData<DataSourceData<TDataSource>, AnyPageParam>,
    DataSourceResponse<TDataSource>,
    DataSourceKey,
    AnyPageParam
> {
    const {
        refetchInterval: refetchIntervalOption,
        queryFn: queryFnOption,
        ...restOptions
    } = composedOptions || {};

    const {refetchInterval, queryFn} = useRefetchInterval(refetchIntervalOption, queryFnOption);

    return {...restOptions, refetchInterval, queryFn};
}
