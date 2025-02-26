import type {
    DefaultError,
    InfiniteData,
    InfiniteQueryObserverOptions,
    InfiniteQueryObserverResult,
    QueryFunctionContext,
    QueryKey,
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

export type InfiniteQueryObserverExtendedOptions<
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = unknown,
> = Overwrite<
    InfiniteQueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey, TPageParam>,
    QueryDataAdditionalOptions<
        TQueryFnData,
        TError,
        InfiniteData<TQueryData, TPageParam>,
        TQueryKey
    >
>;

export type InfiniteQueryDataSource<TParams, TRequest, TResponse, TData, TError, TErrorResponse> =
    DataSource<
        QueryDataSourceContext,
        TParams,
        TRequest,
        TResponse,
        TData,
        TError,
        TErrorResponse,
        InfiniteQueryObserverExtendedOptions<
            ActualResponse<TResponse, TErrorResponse>,
            TError,
            InfiniteData<ActualData<TResponse, TErrorResponse, TData>, Partial<TRequest>>,
            ActualResponse<TResponse, TErrorResponse>,
            DataSourceKey,
            Partial<TRequest>
        >,
        ResultWrapper<
            InfiniteQueryObserverResult<
                InfiniteData<ActualData<TResponse, TErrorResponse, TData>, Partial<TRequest>>,
                TError
            >,
            TRequest,
            TResponse,
            TData,
            TError,
            TErrorResponse
        >,
        QueryFunctionContext<DataSourceKey, Partial<TRequest>>
    > & {
        type: 'infinite';
        next: (
            lastPage: ActualResponse<TResponse, TErrorResponse>,
            allPages: ActualResponse<TResponse, TErrorResponse>[],
        ) => Partial<TRequest> | null | undefined;
        prev?: (
            firstPage: ActualResponse<TResponse, TErrorResponse>,
            allPages: ActualResponse<TResponse, TErrorResponse>[],
        ) => Partial<TRequest> | null | undefined;
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyInfiniteQueryDataSource = InfiniteQueryDataSource<any, any, any, any, any, any>;

// It is used instead of `Partial<DataSourceRequest<TDataSource>>` because TS can't calculate type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyPageParam = Partial<any>;

type ResultWrapper<TResult, TRequest, TResponse, TData, TError, TErrorResponse> =
    TResult extends InfiniteQueryObserverResult<
        InfiniteData<ActualData<TResponse, TErrorResponse, TData>, Partial<TRequest>>,
        TError
    >
        ? Overwrite<
              TResult,
              {
                  status: DataLoaderStatus;
                  data: Array<FlatArray<Array<ActualData<TResponse, TErrorResponse, TData>>, 1>>;
              }
          > & {
              originalStatus: TResult['status'];
              originalData: TResult['data'];
          }
        : never;
