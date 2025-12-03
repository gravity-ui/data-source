import type {
    DefaultError,
    QueryFunctionContext,
    QueryKey,
    QueryObserverOptions,
    QueryObserverResult,
} from '@tanstack/react-query';
import type {Assign, Overwrite} from 'utility-types';

import type {ActualData, DataLoaderStatus, DataSource, DataSourceKey} from '../../../core';
import type {QueryDataSourceContext} from '../../types/base';
import type {QueryDataAdditionalOptions} from '../../types/options';

export type QueryObserverExtendedOptions<
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = never,
> = Assign<
    QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey, TPageParam>,
    QueryDataAdditionalOptions<TQueryFnData, TError, TQueryData, TQueryKey>
>;

export type PlainQueryDataSource<TParams, TRequest, TResponse, TData, TError> = DataSource<
    QueryDataSourceContext,
    TParams,
    TRequest,
    TResponse,
    TData,
    TError,
    QueryObserverExtendedOptions<
        NoInfer<TResponse>,
        NoInfer<TError>,
        ActualData<NoInfer<TData>, NoInfer<TResponse>>,
        NoInfer<TResponse>,
        DataSourceKey
    >,
    ResultWrapper<
        QueryObserverResult<ActualData<NoInfer<TData>, NoInfer<TResponse>>, NoInfer<TError>>,
        NoInfer<TResponse>,
        NoInfer<TData>,
        NoInfer<TError>
    >,
    QueryFunctionContext<DataSourceKey>
> & {
    type: 'plain';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyPlainQueryDataSource = PlainQueryDataSource<any, any, any, any, any>;

type ResultWrapper<TResult, TResponse, TData, TError> =
    TResult extends QueryObserverResult<ActualData<TData, TResponse>, TError>
        ? Overwrite<TResult, {status: DataLoaderStatus}> & {originalStatus: TResult['status']}
        : never;
