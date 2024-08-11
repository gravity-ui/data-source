import {skipToken} from '@tanstack/react-query';
import type {
    InfiniteData,
    InfiniteQueryObserverOptions,
    InfiniteQueryObserverResult,
    QueryFunctionContext,
} from '@tanstack/react-query';

import {composeFullKey, idle} from '../../../core';
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
import {normalizeStatus} from '../../utils/normalizeStatus';

import type {AnyInfiniteQueryDataSource, AnyPageParam} from './types';

const EMPTY_ARRAY: unknown[] = [];
const EMPTY_OBJECT = {};

export const composeOptions = <TDataSource extends AnyInfiniteQueryDataSource>(
    context: DataSourceContext<TDataSource>,
    dataSource: TDataSource,
    params: DataSourceParams<TDataSource>,
    options?: Partial<DataSourceOptions<TDataSource>>,
): InfiniteQueryObserverOptions<
    DataSourceResponse<TDataSource>,
    DataSourceError<TDataSource>,
    InfiniteData<DataSourceData<TDataSource>, AnyPageParam>,
    DataSourceResponse<TDataSource>,
    DataSourceKey,
    AnyPageParam
> => {
    const {transformParams, transformResponse, next, prev} = dataSource;

    const queryFn = (
        fetchContext: QueryFunctionContext<DataSourceKey, AnyPageParam>,
    ): DataSourceResponse<TDataSource> | Promise<DataSourceResponse<TDataSource>> => {
        const request = transformParams ? transformParams(params) : params;
        const paginatedRequest = {...request, ...fetchContext.pageParam};

        return dataSource.fetch(context, fetchContext, paginatedRequest);
    };

    return {
        queryKey: composeFullKey(dataSource, params),
        queryFn: params === idle ? skipToken : queryFn,
        select: transformResponse
            ? (data) => ({...data, pages: data.pages.map(transformResponse)})
            : undefined,
        initialPageParam: EMPTY_OBJECT,
        getNextPageParam: next,
        getPreviousPageParam: prev,
        ...dataSource.options,
        ...options,
    };
};

export const transformResult = <TDataSource extends AnyInfiniteQueryDataSource>(
    result: InfiniteQueryObserverResult<
        InfiniteData<DataSourceData<TDataSource>, AnyPageParam>,
        DataSourceError<TDataSource>
    >,
): DataSourceState<TDataSource> => {
    return {
        ...result,
        status: normalizeStatus(result.status, result.fetchStatus),
        data: result.data?.pages.flat(1) ?? EMPTY_ARRAY,
        originalStatus: result.status,
        originalData: result.data,
    } as DataSourceState<TDataSource>;
};
