import {useMemo} from 'react';

import {skipToken, useInfiniteQuery} from '@tanstack/react-query';
import type {InfiniteData, InfiniteQueryObserverOptions} from '@tanstack/react-query';

import type {
    DataSourceContext,
    DataSourceData,
    DataSourceError,
    DataSourceKey,
    DataSourceOptions,
    DataSourceParams,
    DataSourceRequest,
    DataSourceResponse,
    DataSourceState,
} from '../../../core';
import {useRefetchInterval} from '../../hooks/useRefetchInterval';
import {normalizeStatus} from '../../utils/normalizeStatus';
import {warnDisabledRefetch} from '../../utils/warnDisabledRefetch';

import type {AnyInfiniteQueryDataSource, InfiniteQueryObserverExtendedOptions} from './types';
import {composeOptions} from './utils';

const useInfiniteQueryDataOptions = <TDataSource extends AnyInfiniteQueryDataSource>(
    composedOptions: InfiniteQueryObserverExtendedOptions<
        DataSourceResponse<TDataSource>,
        DataSourceError<TDataSource>,
        InfiniteData<DataSourceData<TDataSource>, Partial<DataSourceRequest<TDataSource>>>,
        DataSourceResponse<TDataSource>,
        DataSourceKey,
        Partial<DataSourceRequest<TDataSource>>
    >,
): InfiniteQueryObserverOptions<
    DataSourceResponse<TDataSource>,
    DataSourceError<TDataSource>,
    InfiniteData<DataSourceData<TDataSource>, Partial<DataSourceRequest<TDataSource>>>,
    DataSourceResponse<TDataSource>,
    DataSourceKey,
    Partial<DataSourceRequest<TDataSource>>
> => {
    const {
        queryFn: queryFnOption,
        refetchInterval: refetchIntervalOption,
        ...restOptions
    } = composedOptions;

    const {queryFn, refetchInterval} = useRefetchInterval(refetchIntervalOption, queryFnOption);

    return {...restOptions, queryFn, refetchInterval};
};

export const useInfiniteQueryData = <TDataSource extends AnyInfiniteQueryDataSource>(
    context: DataSourceContext<TDataSource>,
    dataSource: TDataSource,
    params: DataSourceParams<TDataSource>,
    options?: Partial<DataSourceOptions<TDataSource>>,
): DataSourceState<TDataSource> => {
    const extendedOptions = composeOptions(context, dataSource, params, options);
    const composedOptions = useInfiniteQueryDataOptions(extendedOptions);
    const state = useInfiniteQuery(composedOptions);

    const transformedData = useMemo<DataSourceState<TDataSource>['data']>(
        () => state.data?.pages.flat(1) ?? [],
        [state.data],
    );

    const isDisabled = composedOptions.enabled === false || composedOptions.queryFn === skipToken;

    return {
        ...state,
        status: normalizeStatus(state.status, state.fetchStatus),
        data: transformedData,
        originalStatus: state.status,
        originalData: state.data,
        refetch: isDisabled ? warnDisabledRefetch : state.refetch,
    } as DataSourceState<TDataSource>;
};
