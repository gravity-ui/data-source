import type {InfiniteQueryDataSource, PlainQueryDataSource} from '@gravity-ui/data-source';
import {
    makeInfiniteQueryDataSource as makeInfiniteQueryDataSourceBase,
    makePlainQueryDataSource as makePlainQueryDataSourceBase,
} from '@gravity-ui/data-source';

import type {AppError} from './error';

export const makePlainQueryDataSource = <TParams, TRequest, TResponse, TData, TError = AppError>(
    config: Omit<PlainQueryDataSource<TParams, TRequest, TResponse, TData, TError>, 'type'>,
): PlainQueryDataSource<TParams, TRequest, TResponse, TData, TError> => {
    return makePlainQueryDataSourceBase(config);
};

export const makeInfiniteQueryDataSource = <TParams, TRequest, TResponse, TData, TError = AppError>(
    config: Omit<InfiniteQueryDataSource<TParams, TRequest, TResponse, TData, TError>, 'type'>,
): InfiniteQueryDataSource<TParams, TRequest, TResponse, TData, TError> => {
    return makeInfiniteQueryDataSourceBase(config);
};
