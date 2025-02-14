import {useMemo} from 'react';

import {useInfiniteQuery} from '@tanstack/react-query';
import type {DefaultError, InfiniteQueryObserverOptions, QueryKey} from '@tanstack/react-query';

import type {
    DataSourceContext,
    DataSourceOptions,
    DataSourceParams,
    DataSourceState,
} from '../../../core';
import {useRefetchInterval} from '../../hooks/useRefetchInterval';
import {normalizeStatus} from '../../utils/normalizeStatus';

import type {AnyInfiniteQueryDataSource, InfiniteQueryObserverExtendedOptions} from './types';
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

export function useInfiniteQueryDataOptions<
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = unknown,
>(
    composedOptions: InfiniteQueryObserverExtendedOptions<
        TQueryFnData,
        TError,
        TData,
        TQueryData,
        TQueryKey,
        TPageParam
    >,
): InfiniteQueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey, TPageParam> {
    const {
        refetchInterval: refetchIntervalOption,
        queryFn: queryFnOption,
        ...restOptions
    } = composedOptions || {};

    const {refetchInterval, queryFn} = useRefetchInterval(refetchIntervalOption, queryFnOption);

    return {...restOptions, refetchInterval, queryFn};
}
