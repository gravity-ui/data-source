import type {
    QueryFunctionContext,
    QueryObserverOptions,
    QueryObserverResult,
} from '@tanstack/react-query';
import type {Overwrite} from 'utility-types';

import type {ActualData, DataLoaderStatus, DataSource, DataSourceKey} from '../../../core';
import type {QueryDataSourceContext} from '../../types';

export type PlainQueryDataSource<
    TParams,
    TRequest extends object,
    TResponse,
    TData,
    TError,
> = DataSource<
    QueryDataSourceContext,
    TParams,
    TRequest,
    TResponse,
    TData,
    TError,
    QueryObserverOptions<TResponse, TError, ActualData<TData, TResponse>, TResponse, DataSourceKey>,
    ResultWrapper<QueryObserverResult<ActualData<TData, TResponse>, TError>>,
    QueryFunctionContext<DataSourceKey>
> & {
    type: 'plain';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyPlainQueryDataSource = PlainQueryDataSource<any, any, any, any, any>;

type ResultWrapper<TResult> = TResult extends QueryObserverResult
    ? Overwrite<TResult, {status: DataLoaderStatus}> & {originalStatus: TResult['status']}
    : never;
