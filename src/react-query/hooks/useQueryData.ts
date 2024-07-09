import type {
    DataSourceContext,
    DataSourceOptions,
    DataSourceParams,
    DataSourceState,
} from '../../core';
import {useData} from '../../react';
import {useInfiniteQueryData} from '../impl/infinite/hooks';
import {usePlainQueryData} from '../impl/plain/hooks';
import type {AnyQueryDataSource} from '../types';

import {useQueryContext} from './useQueryContext';

export const useQueryData = <TDataSource extends AnyQueryDataSource>(
    dataSource: TDataSource,
    params: DataSourceParams<TDataSource>,
    options?: DataSourceOptions<TDataSource>,
): DataSourceState<TDataSource> => {
    const context = useQueryContext();

    let state: DataSourceState<AnyQueryDataSource> | undefined;

    // Do not change data source type in the same hook call
    if (dataSource.type === 'plain') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        state = usePlainQueryData(context, dataSource, params, options);
    } else if (dataSource.type === 'infinite') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        state = useInfiniteQueryData(context, dataSource, params, options);
    } else {
        throw new Error('Data Source type must be plain or infinite');
    }

    return state as DataSourceState<TDataSource>;
};

// Do not use it yet. It will be reworked
export const _useQueryData = <TDataSource extends AnyQueryDataSource>(
    dataSource: TDataSource,
    params: DataSourceParams<TDataSource>,
    options?: DataSourceOptions<TDataSource>,
) => {
    const context = useQueryContext() as DataSourceContext<TDataSource>;
    const [state] = useData<TDataSource>(dataSource, context, params, options);

    return state;
};
