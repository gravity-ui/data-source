import type {InfiniteQueryDataSource} from './types';

export const makeInfiniteQueryDataSource = <
    TParams,
    TRequest,
    TResponse,
    TData,
    TError,
    TErrorResponse,
>(
    config: Omit<
        InfiniteQueryDataSource<TParams, TRequest, TResponse, TData, TError, TErrorResponse>,
        'type'
    >,
): InfiniteQueryDataSource<TParams, TRequest, TResponse, TData, TError, TErrorResponse> => ({
    ...config,
    type: 'infinite',
});
