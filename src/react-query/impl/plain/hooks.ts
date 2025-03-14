import {type QueryObserverOptions, useQuery} from '@tanstack/react-query';

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
import {useRefetchInterval} from '../../hooks/useRefetchInterval';
import {normalizeStatus} from '../../utils/normalizeStatus';

import type {AnyPlainQueryDataSource, QueryObserverExtendedOptions} from './types';
import {composeOptions} from './utils';

const usePlainQueryDataOptions = <TDataSource extends AnyPlainQueryDataSource>(
    composedOptions: QueryObserverExtendedOptions<
        DataSourceResponse<TDataSource>,
        DataSourceError<TDataSource>,
        DataSourceData<TDataSource>,
        DataSourceResponse<TDataSource>,
        DataSourceKey
    >,
): QueryObserverOptions<
    DataSourceResponse<TDataSource>,
    DataSourceError<TDataSource>,
    DataSourceData<TDataSource>,
    DataSourceResponse<TDataSource>,
    DataSourceKey
> => {
    const {
        queryFn: queryFnOption,
        refetchInterval: refetchIntervalOption,
        ...restOptions
    } = composedOptions;

    const {queryFn, refetchInterval} = useRefetchInterval(refetchIntervalOption, queryFnOption);

    return {...restOptions, queryFn, refetchInterval};
};

export const usePlainQueryData = <TDataSource extends AnyPlainQueryDataSource>(
    context: DataSourceContext<TDataSource>,
    dataSource: TDataSource,
    params: DataSourceParams<TDataSource>,
    options?: Partial<DataSourceOptions<TDataSource>>,
): DataSourceState<TDataSource> => {
    const extendedOptions = composeOptions(context, dataSource, params, options);
    const composedOptions = usePlainQueryDataOptions(extendedOptions);
    const state = useQuery(composedOptions);

    return {
        ...state,
        status: normalizeStatus(state.status, state.fetchStatus),
        originalStatus: state.status,
    } as DataSourceState<TDataSource>;
};
