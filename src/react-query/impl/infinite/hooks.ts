import {useMemo} from 'react';

import {useInfiniteQuery} from '@tanstack/react-query';

import type {
    DataSourceContext,
    DataSourceOptions,
    DataSourceParams,
    DataSourceState,
} from '../../../core';
import {normalizeStatus} from '../../utils/normalizeStatus';

import type {AnyInfiniteQueryDataSource} from './types';
import {composeOptions} from './utils';

export const useInfiniteQueryData = <TDataSource extends AnyInfiniteQueryDataSource>(
    context: DataSourceContext<TDataSource>,
    dataSource: TDataSource,
    params: DataSourceParams<TDataSource>,
    options?: Partial<DataSourceOptions<TDataSource>>,
): DataSourceState<TDataSource> => {
    const composedOptions = composeOptions(context, dataSource, params, options);
    const result = useInfiniteQuery(composedOptions);

    const transformedData = useMemo<DataSourceState<TDataSource>['data']>(
        () => result.data?.pages.flat(1) ?? [],
        [result.data],
    );

    return {
        ...result,
        status: normalizeStatus(result.status, result.fetchStatus),
        data: transformedData,
        originalStatus: result.status,
        originalData: result.data,
    } as DataSourceState<TDataSource>;
};
