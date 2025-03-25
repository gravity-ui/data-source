import type {
    DefaultError,
    QueryFunctionContext,
    QueryKey,
    QueryObserverOptions,
    QueryObserverResult,
} from '@tanstack/react-query';
import type {Overwrite} from 'utility-types';

import type {
    ActualData,
    ActualResponse,
    DataLoaderStatus,
    DataSource,
    DataSourceKey,
} from '../../../core';
import type {QueryDataSourceContext} from '../../types/base';
import type {QueryDataAdditionalOptions} from '../../types/options';

export type QueryObserverExtendedOptions<
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = never,
> = Overwrite<
    QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey, TPageParam>,
    QueryDataAdditionalOptions<TQueryFnData, TError, TQueryData, TQueryKey>
>;

export type PlainQueryDataSource<TParams, TRequest, TResponse, TData, TError, TErrorResponse> =
    DataSource<
        QueryDataSourceContext,
        TParams,
        TRequest,
        TResponse,
        TData,
        TError,
        TErrorResponse,
        QueryObserverExtendedOptions<
            ActualResponse<NoInfer<TResponse>, NoInfer<TErrorResponse>>,
            NoInfer<TError>,
            ActualData<NoInfer<TResponse>, NoInfer<TData>, NoInfer<TErrorResponse>>,
            ActualResponse<NoInfer<TResponse>, NoInfer<TErrorResponse>>,
            DataSourceKey
        >,
        ResultWrapper<
            QueryObserverResult<
                ActualData<NoInfer<TResponse>, NoInfer<TData>, NoInfer<TErrorResponse>>,
                NoInfer<TError>
            >,
            NoInfer<TResponse>,
            NoInfer<TData>,
            NoInfer<TError>,
            NoInfer<TErrorResponse>
        >,
        QueryFunctionContext<DataSourceKey>
    > & {
        type: 'plain';
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyPlainQueryDataSource = PlainQueryDataSource<any, any, any, any, any, any>;

type ResultWrapper<TResult, TResponse, TData, TError, TErrorResponse> =
    TResult extends QueryObserverResult<ActualData<TResponse, TData, TErrorResponse>, TError>
        ? Overwrite<TResult, {status: DataLoaderStatus}> & {originalStatus: TResult['status']}
        : never;
