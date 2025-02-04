import type {Query, QueryClient} from '@tanstack/react-query';

import type {DataSourceOptions} from '../core';

import type {AnyInfiniteQueryDataSource} from './impl/infinite/types';
import type {AnyPlainQueryDataSource} from './impl/plain/types';

export interface QueryDataSourceContext {
    queryClient: QueryClient;
}

export type AnyQueryDataSource = AnyPlainQueryDataSource | AnyInfiniteQueryDataSource;

export type BaseRefetchInterval = number | false | ((query: Query) => number | false | undefined);

export type ProgressiveRefetchInterval = {
    minInterval: number;
    maxInterval: number;
};

export type RefetchInterval = BaseRefetchInterval | ProgressiveRefetchInterval;

export type QueryDataOptions<TDataSource extends AnyQueryDataSource> = Omit<
    DataSourceOptions<TDataSource>,
    'refetchInterval'
> & {
    refetchInterval?: BaseRefetchInterval;
};
