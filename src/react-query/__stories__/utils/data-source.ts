import type {InfiniteQueryDataSource, PlainQueryDataSource} from '../..';
import {
    makeInfiniteQueryDataSource as makeInfiniteQueryDataSourceBase,
    makePlainQueryDataSource as makePlainQueryDataSourceBase,
} from '../..';
import type {AppError} from '../types/error';

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
