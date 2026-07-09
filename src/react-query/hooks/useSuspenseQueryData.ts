import type {Query} from '@tanstack/react-query';
import type {Overwrite} from 'utility-types';

import type {
    DataSourceData,
    DataSourceOptions,
    DataSourceParams,
    DataSourceState,
    idle,
} from '../../core';
import type {AnyQueryDataSource} from '../types/base';

import {useQueryData} from './useQueryData';

type SuspenseQueryOptions<TDataSource extends AnyQueryDataSource> = Omit<
    Partial<DataSourceOptions<TDataSource>>,
    'suspense' | 'enabled' | 'throwOnError' | 'retryOnMount' | 'placeholderData'
>;

type SuspenseQueryResult<TDataSource extends AnyQueryDataSource> = Overwrite<
    Omit<DataSourceState<TDataSource>, 'isPlaceholderData' | 'promise'>,
    {data: NonNullable<DataSourceData<TDataSource>>}
>;

const defaultThrowOnError = (_error: unknown, query: Query) => query.state.data === undefined;

export const useSuspenseQueryData = <TDataSource extends AnyQueryDataSource>(
    dataSource: TDataSource,
    params: Exclude<DataSourceParams<TDataSource>, typeof idle>,
    options?: SuspenseQueryOptions<TDataSource>,
): SuspenseQueryResult<TDataSource> => {
    return useQueryData(dataSource, params, {
        ...options,
        suspense: true,
        enabled: true,
        throwOnError: defaultThrowOnError,
        retryOnMount: true,
        placeholderData: undefined,
    } as Partial<DataSourceOptions<TDataSource>>) as SuspenseQueryResult<TDataSource>;
};
