import {useInfiniteQuery} from '@tanstack/react-query';

import type {
    DataSourceContext,
    DataSourceOptions,
    DataSourceParams,
    DataSourceState,
} from '../../../core';

import type {AnyInfiniteQueryDataSource} from './types';
import {composeOptions, transformResult} from './utils';

export const useInfiniteQueryData = <TDataSource extends AnyInfiniteQueryDataSource>(
    context: DataSourceContext<TDataSource>,
    dataSource: TDataSource,
    params: DataSourceParams<TDataSource>,
    options?: Partial<DataSourceOptions<TDataSource>>,
): DataSourceState<TDataSource> => {
    const composedOptions = composeOptions(context, dataSource, params, options);
    const result = useInfiniteQuery(composedOptions);

    return transformResult(result);
};
