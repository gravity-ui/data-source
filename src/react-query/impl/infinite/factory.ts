import type {InfiniteQueryDataSource} from './types';

export const makeInfiniteQueryDataSource = <TParams, TRequest, TResponse, TData, TError>(
    config: Omit<InfiniteQueryDataSource<TParams, TRequest, TResponse, TData, TError>, 'type'>,
): InfiniteQueryDataSource<TParams, TRequest, TResponse, TData, TError> => ({
    ...config,
    type: 'infinite',
});
