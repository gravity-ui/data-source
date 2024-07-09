import {PlainQueryDataObserver} from './observer';
import type {PlainQueryDataSource} from './types';

export const makePlainQueryDataSource = <TParams, TRequest, TResponse, TData, TError>(
    config: Omit<PlainQueryDataSource<TParams, TRequest, TResponse, TData, TError>, 'type'>,
): PlainQueryDataSource<TParams, TRequest, TResponse, TData, TError> => ({
    ...config,
    type: 'plain',
    observe(context, params, options) {
        return new PlainQueryDataObserver(context, this, params, options);
    },
});
