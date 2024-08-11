import type {
    InfiniteData,
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
    InfiniteQueryObserverOptions<
        TResponse,
        TError,
        InfiniteData<ActualData<TData, TResponse>, Partial<TRequest>>,
        TResponse,
        DataSourceKey,
        Partial<TRequest>
    >,
    ResultWrapper<
        InfiniteQueryObserverResult<
            InfiniteData<ActualData<TData, TResponse>, Partial<TRequest>>,
            TError
        >,
        TRequest,
        TResponse,
        TData,
        TError
    >,
    QueryFunctionContext<DataSourceKey, Partial<TRequest>>
> & {
    type: 'infinite';
    next: (lastPage: TResponse, allPages: TResponse[]) => Partial<TRequest> | null | undefined;
    prev?: (firstPage: TResponse, allPages: TResponse[]) => Partial<TRequest> | null | undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyInfiniteQueryDataSource = InfiniteQueryDataSource<any, any, any, any, any>;

// It is used instead of `Partial<DataSourceRequest<TDataSource>>` because TS can't calculate type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyPageParam = Partial<any>;

type ResultWrapper<TResult, TRequest, TResponse, TData, TError> =
    TResult extends InfiniteQueryObserverResult<
        InfiniteData<ActualData<TData, TResponse>, Partial<TRequest>>,
        TError
    >
        ? Overwrite<
              TResult,
              {status: DataLoaderStatus; data: DataWrapper<ActualData<TData, TResponse>>}
          > & {
              originalStatus: TResult['status'];
              originalData: TResult['data'];
          }
        : never;

type DataWrapper<TActualData> = Array<FlatArray<Array<TActualData>, 1>>;
