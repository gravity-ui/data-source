import type {
    QueryFunctionContext,
    QueryObserverOptions,
    QueryObserverResult,
} from '@tanstack/react-query';

import {composeFullKey, idle} from '../../../core';
import type {
    DataSourceContext,
    DataSourceData,
    DataSourceError,
    DataSourceKey,
    DataSourceOptions,
    DataSourceParams,
    DataSourceResponse,
    DataSourceState,
} from '../../../core';
import {normalizeStatus} from '../../utils/normalizeStatus';

import type {AnyPlainQueryDataSource} from './types';

export const composeOptions = <TDataSource extends AnyPlainQueryDataSource>(
    context: DataSourceContext<TDataSource>,
    dataSource: TDataSource,
    params: DataSourceParams<TDataSource>,
    options?: DataSourceOptions<TDataSource>,
): QueryObserverOptions<
    DataSourceResponse<TDataSource>,
    DataSourceError<TDataSource>,
    DataSourceData<TDataSource>,
    DataSourceResponse<TDataSource>
> => {
    const {transformParams} = dataSource;

    return {
        ...dataSource.options,
        enabled: params !== idle,
        queryKey: composeFullKey(dataSource, params),
        queryFn: (fetchContext: QueryFunctionContext<DataSourceKey, unknown>) =>
            dataSource.fetch(
                context,
                fetchContext,
                transformParams ? transformParams(params) : params,
            ),
        select: dataSource.transformResponse,
        ...options,
    };
};

export const transformResult = <TDataSource extends AnyPlainQueryDataSource>(
    result: QueryObserverResult<DataSourceData<TDataSource>, DataSourceError<TDataSource>>,
) => {
    return {
        ...result,
        status: normalizeStatus(result.status, result.fetchStatus),
        originalStatus: result.status,
    } as DataSourceState<TDataSource>;
};
