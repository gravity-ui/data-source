import {
    type QueryFunctionContext,
    type QueryObserverOptions,
    type QueryObserverResult,
    skipToken,
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
    options?: Partial<DataSourceOptions<TDataSource>>,
): QueryObserverOptions<
    DataSourceResponse<TDataSource>,
    DataSourceError<TDataSource>,
    DataSourceData<TDataSource>,
    DataSourceResponse<TDataSource>,
    DataSourceKey
> => {
    const {transformParams} = dataSource;

    const queryFn = (
        fetchContext: QueryFunctionContext<DataSourceKey>,
    ): DataSourceResponse<TDataSource> | Promise<DataSourceResponse<TDataSource>> => {
        return dataSource.fetch(
            context,
            fetchContext,
            transformParams ? transformParams(params) : params,
        );
    };

    return {
        queryKey: composeFullKey(dataSource, params),
        queryFn: params === idle ? skipToken : queryFn,
        select: dataSource.transformResponse,
        ...dataSource.options,
        ...options,
    };
};

export const transformResult = <TDataSource extends AnyPlainQueryDataSource>(
    result: QueryObserverResult<DataSourceData<TDataSource>, DataSourceError<TDataSource>>,
): DataSourceState<TDataSource> => {
    return {
        ...result,
        status: normalizeStatus(result.status, result.fetchStatus),
        originalStatus: result.status,
    } as DataSourceState<TDataSource>;
};
