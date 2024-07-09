import {InfiniteQueryDataObserver} from './observer';
import type {InfiniteQueryDataSource} from './types';

export const makeInfiniteQueryDataSource = <TParams, TRequest, TResponse, TData, TError>(
    config: Omit<InfiniteQueryDataSource<TParams, TRequest, TResponse, TData, TError>, 'type'>,
): InfiniteQueryDataSource<TParams, TRequest, TResponse, TData, TError> => ({
    ...config,
    type: 'infinite',
    observe(context, params, options) {
        return new InfiniteQueryDataObserver(context, this, params, options);
    },
});
