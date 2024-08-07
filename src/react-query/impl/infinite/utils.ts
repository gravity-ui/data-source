import type {
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
    DataSourceRequest,
    DataSourceResponse,
    DataSourceState,
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
            fetchContext: QueryFunctionContext<
                DataSourceKey,
                Partial<DataSourceRequest<TDataSource>> | undefined
            >,
        ) => {
            const actualParams = transformParams ? transformParams(params) : params;
            const request =
                typeof actualParams === 'object'
                    ? {...actualParams, ...fetchContext.pageParam}
                    : actualParams;

            return dataSource.fetch(context, fetchContext, request);
        },
        select: transformResponse
            ? (data) => ({...data, pages: data.pages.map(transformResponse)})
            : undefined,
        getNextPageParam: next,
        getPreviousPageParam: prev,
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
