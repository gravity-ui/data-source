import type {PlainQueryDataSource} from './types';

export const makePlainQueryDataSource = <
    TParams,
    TRequest extends object,
    TResponse,
    TData,
    TError,
>(
    config: Omit<PlainQueryDataSource<TParams, TRequest, TResponse, TData, TError>, 'type'>,
): PlainQueryDataSource<TParams, TRequest, TResponse, TData, TError> => ({
    ...config,
    type: 'plain',
});
