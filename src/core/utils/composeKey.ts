// TODO(DakEnviy): Do not use react-query in core
import {hashQueryKey} from '@tanstack/react-query';

import {idle} from '../constants';
import type {AnyDataSource, DataSourceParams} from '../types/DataSource';

export const composeKey = <TDataSource extends AnyDataSource>(
    dataSource: TDataSource,
    params: DataSourceParams<TDataSource>,
): string =>
    params === idle ? `${dataSource.name}:idle` : `${dataSource.name}(${hashQueryKey(params)})`;
