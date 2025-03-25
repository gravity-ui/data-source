import type {PlainQueryDataSource} from './types';

export const makePlainQueryDataSource = <
    TParams,
    TRequest,
    TResponse,
    TData,
    TError,
    TErrorResponse,
>(
    config: Omit<
        PlainQueryDataSource<TParams, TRequest, TResponse, TData, TError, TErrorResponse>,
        'type'
    >,
): PlainQueryDataSource<TParams, TRequest, TResponse, TData, TError, TErrorResponse> => ({
    ...config,
    type: 'plain',
});
