import type {
    InfiniteQueryObserverOptions,
    InfiniteQueryObserverResult,
    QueryFunctionContext,
} from '@tanstack/react-query';
import type {Overwrite} from 'utility-types';

import type {ActualData, DataLoaderStatus, DataSource, DataSourceKey} from '../../../core';
import type {QueryDataSourceContext} from '../../types';

export type InfiniteQueryDataSource<TParams, TRequest, TResponse, TData, TError> = DataSource<
    QueryDataSourceContext,
    TParams,
    TRequest,
    TResponse,
    TData,
    TError,
    InfiniteQueryObserverOptions<TResponse, TError, ActualData<TData, TResponse>>,
    ResultWrapper<InfiniteQueryObserverResult<ActualData<TData, TResponse>, TError>>,
    QueryFunctionContext<DataSourceKey, TParams>
> & {
    type: 'infinite';
    next: (lastPage: TResponse, allPages: TResponse[]) => Partial<TParams> | undefined;
    prev?: (firstPage: TResponse, allPages: TResponse[]) => Partial<TParams> | undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyInfiniteQueryDataSource = InfiniteQueryDataSource<any, any, any, any, any>;

type ResultWrapper<T> =
    T extends InfiniteQueryObserverResult<infer TData>
        ? Overwrite<T, {status: DataLoaderStatus; data: TData}> & {
              originalStatus: T['status'];
              originalData: T['data'];
          }
        : never;
