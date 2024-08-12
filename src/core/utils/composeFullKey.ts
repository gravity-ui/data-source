import type {AnyDataSource, DataSourceParams} from '../types/DataSource';

import {composeKey} from './composeKey';

export const composeFullKey = <TDataSource extends AnyDataSource>(
    dataSource: TDataSource,
    params: DataSourceParams<TDataSource>,
): ReadonlyArray<string> => {
    const tags = dataSource.tags?.(params) ?? [];

    return [dataSource.name, ...tags, composeKey(dataSource, params)];
};
