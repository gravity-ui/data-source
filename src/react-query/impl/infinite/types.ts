import type {
    DefaultError,
    InfiniteData,
    InfiniteQueryObserverOptions,
    InfiniteQueryObserverResult,
    QueryFunctionContext,
    QueryKey,
} from '@tanstack/react-query';
import type {Assign, Overwrite} from 'utility-types';

import type {ActualData, DataLoaderStatus, DataSource, DataSourceKey} from '../../../core';
import type {QueryDataSourceContext} from '../../types/base';
import type {QueryDataAdditionalOptions} from '../../types/options';

export type InfiniteQueryObserverExtendedOptions<
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = unknown,
> = Assign<
    InfiniteQueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey, TPageParam>,
    QueryDataAdditionalOptions<
        TQueryFnData,
        TError,
        InfiniteData<TQueryData, TPageParam>,
        TQueryKey
    >
>;

export type InfiniteQueryDataSource<TParams, TRequest, TResponse, TData, TError> = DataSource<
    QueryDataSourceContext,
    TParams,
    TRequest,
    TResponse,
    TData,
    TError,
    InfiniteQueryObserverExtendedOptions<
        NoInfer<TResponse>,
        NoInfer<TError>,
        InfiniteData<ActualData<NoInfer<TData>, NoInfer<TResponse>>, Partial<TRequest>>,
        NoInfer<TResponse>,
        DataSourceKey,
        Partial<NoInfer<TRequest>>
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
    QueryFunctionContext<DataSourceKey, Partial<NoInfer<TRequest>>>
> & {
    type: 'infinite';
    next: (
        lastPage: NoInfer<TResponse>,
        allPages: NoInfer<TResponse>[],
    ) => Partial<NoInfer<TRequest>> | null | undefined;
    prev?: (
        firstPage: NoInfer<TResponse>,
        allPages: NoInfer<TResponse>[],
    ) => Partial<NoInfer<TRequest>> | null | undefined;
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
              {
                  status: DataLoaderStatus;
                  data: Array<FlatArray<Array<ActualData<TData, TResponse>>, 1>>;
                  refetch: () => Promise<void>;
              }
          > & {
              originalStatus: TResult['status'];
              originalData: TResult['data'];
          }
        : never;
