import {type QueryFunctionContext, skipToken} from '@tanstack/react-query';

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
import type {nullSymbol, undefinedSymbol} from '../../constants';
import {formatNullableValue} from '../../utils/formatNullableValue';
import {parseNullableValue} from '../../utils/parseNullableValue';

import type {AnyPlainQueryDataSource, QueryObserverExtendedOptions} from './types';

export const composeOptions = <TDataSource extends AnyPlainQueryDataSource>(
    context: DataSourceContext<TDataSource>,
    dataSource: TDataSource,
    params: DataSourceParams<TDataSource>,
    options?: Partial<DataSourceOptions<TDataSource>>,
): QueryObserverExtendedOptions<
    DataSourceResponse<TDataSource>,
    DataSourceError<TDataSource>,
    DataSourceData<TDataSource>,
    DataSourceResponse<TDataSource>,
    DataSourceKey
> => {
    const {transformParams, transformResponse} = dataSource;

    const queryFn = async (
        fetchContext: QueryFunctionContext<DataSourceKey>,
    ): Promise<DataSourceResponse<TDataSource> | typeof undefinedSymbol | typeof nullSymbol> => {
        const response = await dataSource.fetch(
            context,
            fetchContext,
            transformParams ? transformParams(params) : params,
        );

        return formatNullableValue(response);
    };

    const select = (
        response: DataSourceResponse<TDataSource> | typeof undefinedSymbol | typeof nullSymbol,
    ): DataSourceData<TDataSource> => {
        const actualResponse = parseNullableValue(response) as DataSourceData<TDataSource>;

        return transformResponse ? transformResponse(actualResponse) : actualResponse;
    };

    const meta = {
        invalidate: options?.invalidate,
        optimistic: options?.optimistic,
    };

    return {
        queryKey: composeFullKey(dataSource, params),
        queryFn: params === idle ? skipToken : queryFn,
        select,
        meta,
        ...dataSource.options,
        ...options,
    };
};
