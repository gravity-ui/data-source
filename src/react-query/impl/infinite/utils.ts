import type {
    InfiniteQueryObserverOptions,
    InfiniteQueryObserverResult,
    QueryFunctionContext,
} from '@tanstack/react-query';

import {
    type DataSourceContext,
    type DataSourceData,
    type DataSourceError,
    type DataSourceKey,
    type DataSourceOptions,
    type DataSourceParams,
    type DataSourceResponse,
    type DataSourceState,
    composeFullKey,
    idle,
} from '../../../core';
import {normalizeStatus} from '../../utils/normalizeStatus';

import type {AnyInfiniteQueryDataSource} from './types';

const EMPTY_ARRAY: unknown[] = [];

export const composeOptions = <TDataSource extends AnyInfiniteQueryDataSource>(
    context: DataSourceContext<TDataSource>,
    dataSource: TDataSource,
    params: DataSourceParams<TDataSource>,
    options?: DataSourceOptions<TDataSource>,
): InfiniteQueryObserverOptions<
    DataSourceResponse<TDataSource>,
    DataSourceError<TDataSource>,
    DataSourceData<TDataSource>,
    DataSourceResponse<TDataSource>
> => {
    const {transformParams, transformResponse, next, prev} = dataSource;

    return {
        ...dataSource.options,
        enabled: params !== idle,
        queryKey: composeFullKey(dataSource, params),
        queryFn: (
            fetchContext: QueryFunctionContext<DataSourceKey, DataSourceParams<TDataSource>>,
        ) => {
            const actualParams = fetchContext.pageParam ?? params;

            return dataSource.fetch(
                context,
                fetchContext,
                transformParams ? transformParams(actualParams) : actualParams,
            );
        },
        select: transformResponse
            ? (data) => ({...data, pages: data.pages.map(transformResponse)})
            : undefined,
        getNextPageParam: (lastPage, allPages) => {
            const nextParamsPatch = next(lastPage, allPages);

            return nextParamsPatch ? {...params, ...nextParamsPatch} : undefined;
        },
        getPreviousPageParam: prev
            ? (firstPage, allPages) => {
                  const prevParamsPatch = prev(firstPage, allPages);

                  return prevParamsPatch ? {...params, ...prevParamsPatch} : undefined;
              }
            : undefined,
        ...options,
    };
};

export const transformResult = <TDataSource extends AnyInfiniteQueryDataSource>(
    result: InfiniteQueryObserverResult<DataSourceData<TDataSource>, DataSourceError<TDataSource>>,
) => {
    return {
        ...result,
        status: normalizeStatus(result.status, result.fetchStatus),
        data: result.data?.pages.flat() ?? EMPTY_ARRAY,
        originalStatus: result.status,
        originalData: result.data,
    } as DataSourceState<TDataSource>;
};
