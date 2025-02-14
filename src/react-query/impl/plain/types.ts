import type {
    DefaultError,
    QueryFunctionContext,
    QueryKey,
    QueryObserverOptions,
    QueryObserverResult,
} from '@tanstack/react-query';
import type {Overwrite} from 'utility-types';

import type {ActualData, DataLoaderStatus, DataSource, DataSourceKey} from '../../../core';
import type {QueryDataExtendedOptions, QueryDataSourceContext} from '../../types';

export interface QueryObserverExtendedOptions<
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = never,
> extends Omit<
            QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey, TPageParam>,
            'refetchInterval'
        >,
        QueryDataExtendedOptions<TQueryFnData, TError, TQueryData, TQueryKey> {}

export type PlainQueryDataSource<TParams, TRequest, TResponse, TData, TError> = DataSource<
    QueryDataSourceContext,
    TParams,
    TRequest,
    TResponse,
    TData,
    TError,
    QueryObserverExtendedOptions<
        TResponse,
        TError,
        ActualData<TData, TResponse>,
        TResponse,
        DataSourceKey
    >,
    ResultWrapper<
        QueryObserverResult<ActualData<TData, TResponse>, TError>,
        TResponse,
        TData,
        TError
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
