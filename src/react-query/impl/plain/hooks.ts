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
import type {AnyQueryDataSource} from '../../types';
import {normalizeStatus} from '../../utils/normalizeStatus';

import type {AnyPlainQueryDataSource, QueryObserverExtendedOptions} from './types';
import {composeOptions} from './utils';

export const usePlainQueryData = <TDataSource extends AnyPlainQueryDataSource>(
    context: DataSourceContext<TDataSource>,
    dataSource: TDataSource,
    params: DataSourceParams<TDataSource>,
    options?: Partial<DataSourceOptions<TDataSource>>,
): DataSourceState<TDataSource> => {
    const composedOptions = composeOptions(context, dataSource, params, options);

    const extendedOptions = useQueryDataOptions(composedOptions);

    const result = useQuery(extendedOptions);

    return {
        ...result,
        status: normalizeStatus(result.status, result.fetchStatus),
        originalStatus: result.status,
    } as DataSourceState<TDataSource>;
};

export function useQueryDataOptions<TDataSource extends AnyQueryDataSource>(
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
> {
    const {
        refetchInterval: refetchIntervalOption,
        queryFn: queryFnOption,
        ...restOptions
    } = composedOptions || {};

    const {refetchInterval, queryFn} = useRefetchInterval(refetchIntervalOption, queryFnOption);

    return {...restOptions, refetchInterval, queryFn};
}
