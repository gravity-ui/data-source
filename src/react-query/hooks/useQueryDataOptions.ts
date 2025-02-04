import type {DataSourceOptions} from '../../core';
import type {AnyQueryDataSource, QueryDataOptions} from '../types';

import {useRefetchInterval} from './useRefetchInterval';

export function useQueryDataOptions<TDataSource extends AnyQueryDataSource>(
    extendedOptions?: Partial<QueryDataOptions<TDataSource>>,
): Partial<DataSourceOptions<TDataSource>> {
    const {refetchInterval: refetchIntervalOption, ...restOptions} = extendedOptions || {};

    const refetchInterval = useRefetchInterval(refetchIntervalOption);

    return {...restOptions, refetchInterval} as Partial<DataSourceOptions<TDataSource>>;
}
