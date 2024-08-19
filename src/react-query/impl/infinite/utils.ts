import {skipToken} from '@tanstack/react-query';
import type {
    InfiniteData,
    InfiniteQueryObserverOptions,
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
} from '../../../core';

import type {AnyInfiniteQueryDataSource, AnyPageParam} from './types';

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
