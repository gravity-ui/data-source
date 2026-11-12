import {type QueryObserverOptions, skipToken, useQuery} from '@tanstack/react-query';

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
import {useKeepPreviousError} from '../../hooks/useKeepPreviousError';
import {useRefetchInterval} from '../../hooks/useRefetchInterval';
import {normalizeStatus} from '../../utils/normalizeStatus';
import {warnDisabledRefetch} from '../../utils/warnDisabledRefetch';
import {wrapRefetch} from '../../utils/wrapRefetch';

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
        keepPreviousError: _keepPreviousError,
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

    const isDisabled = composedOptions.enabled === false || composedOptions.queryFn === skipToken;

    const {state: displayState, forget} = useKeepPreviousError(
        extendedOptions.keepPreviousError,
        state,
        composedOptions.queryKey,
    );

    return {
        ...displayState,
        status: normalizeStatus(displayState.status, displayState.fetchStatus),
        originalStatus: state.status,
        refetch: isDisabled ? warnDisabledRefetch : wrapRefetch(state.refetch, forget),
    } as DataSourceState<TDataSource>;
};
