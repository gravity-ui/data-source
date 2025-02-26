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
import {formatNullableValue, parseNullableValue} from '../utils';

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
    const {transformParams, transformError, transformResponse} = dataSource;

    const queryFn = async (
        fetchContext: QueryFunctionContext<DataSourceKey>,
    ): Promise<DataSourceResponse<TDataSource>> => {
        try {
            const fetchResult = await dataSource.fetch(
                context,
                fetchContext,
                transformParams ? transformParams(params) : params,
            );

            return formatNullableValue(fetchResult);
        } catch (error) {
            if (!transformError) throw error;

            return formatNullableValue(transformError(error));
        }
    };

    const innerTransform = (response: any): any => {
        const actualResponse = parseNullableValue(response);

        return transformResponse ? transformResponse(actualResponse) : actualResponse;
    };

    return {
        queryKey: composeFullKey(dataSource, params),
        queryFn: params === idle ? skipToken : queryFn,
        select: innerTransform,
        ...dataSource.options,
        ...options,
    };
};
