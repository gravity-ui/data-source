import type {DataSourceOptions, DataSourceParams, DataSourceState} from '../../core';
import {useInfiniteQueryData} from '../impl/infinite/hooks';
import type {AnyInfiniteQueryDataSource} from '../impl/infinite/types';
import {usePlainQueryData} from '../impl/plain/hooks';
import type {AnyQueryDataSource} from '../types';
import {notReachable} from '../utils/notReachable';

import {useQueryContext} from './useQueryContext';

export const useQueryData = <TDataSource extends AnyQueryDataSource>(
    dataSource: TDataSource,
    params: DataSourceParams<TDataSource>,
    options?: Partial<DataSourceOptions<TDataSource>>,
): DataSourceState<TDataSource> => {
    const context = useQueryContext();

    const type = dataSource.type;
    let state: DataSourceState<AnyQueryDataSource> | undefined;

    // Do not change data source type in the same hook call
    if (type === 'plain') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        state = usePlainQueryData(context, dataSource, params, options);
    } else if (type === 'infinite') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        state = useInfiniteQueryData(
            context,
            dataSource,
            params,
            // TS can't calculate types in this place
            options as Partial<DataSourceOptions<AnyInfiniteQueryDataSource>> | undefined,
        );
    } else {
        return notReachable(type, `Data Source type must be plain or infinite, got: ${type}`);
    }

    return state as DataSourceState<TDataSource>;
};
