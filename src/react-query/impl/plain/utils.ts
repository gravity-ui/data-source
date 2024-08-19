import {
    type QueryFunctionContext,
    type QueryObserverOptions,
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
} from '../../../core';

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
