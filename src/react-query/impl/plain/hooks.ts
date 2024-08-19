import {useQuery} from '@tanstack/react-query';

import type {
    DataSourceContext,
    DataSourceOptions,
    DataSourceParams,
    DataSourceState,
} from '../../../core';
import {normalizeStatus} from '../../utils/normalizeStatus';

import type {AnyPlainQueryDataSource} from './types';
import {composeOptions} from './utils';

export const usePlainQueryData = <TDataSource extends AnyPlainQueryDataSource>(
    context: DataSourceContext<TDataSource>,
    dataSource: TDataSource,
    params: DataSourceParams<TDataSource>,
    options?: Partial<DataSourceOptions<TDataSource>>,
): DataSourceState<TDataSource> => {
    const composedOptions = composeOptions(context, dataSource, params, options);
    const result = useQuery(composedOptions);

    return {
        ...result,
        status: normalizeStatus(result.status, result.fetchStatus),
        originalStatus: result.status,
    } as DataSourceState<TDataSource>;
};
