import {skipToken} from '@tanstack/react-query';
import type {InfiniteData, QueryFunctionContext} from '@tanstack/react-query';

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

import type {
    AnyInfiniteQueryDataSource,
    AnyPageParam,
    InfiniteQueryObserverExtendedOptions,
} from './types';

const EMPTY_OBJECT = {};

export const composeOptions = <TDataSource extends AnyInfiniteQueryDataSource>(
    context: DataSourceContext<TDataSource>,
    dataSource: TDataSource,
    params: DataSourceParams<TDataSource>,
    options?: Partial<DataSourceOptions<TDataSource>>,
): InfiniteQueryObserverExtendedOptions<
    DataSourceResponse<TDataSource>,
    DataSourceError<TDataSource>,
    InfiniteData<DataSourceData<TDataSource>, AnyPageParam>,
    DataSourceResponse<TDataSource>,
    DataSourceKey,
    AnyPageParam
> => {
    const {transformParams, transformError, transformResponse, next, prev} = dataSource;

    const queryFn = async (
        fetchContext: QueryFunctionContext<DataSourceKey, AnyPageParam>,
    ): Promise<DataSourceResponse<TDataSource>> => {
        const request = transformParams ? transformParams(params) : params;
        const paginatedRequest = {...request, ...fetchContext.pageParam};

        try {
            const fetchResult = await dataSource.fetch(context, fetchContext, paginatedRequest);

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
        select: (data) => ({...data, pages: data.pages.map(innerTransform)}),
        initialPageParam: EMPTY_OBJECT,
        getNextPageParam: next,
        getPreviousPageParam: prev,
        ...dataSource.options,
        ...options,
    };
};
