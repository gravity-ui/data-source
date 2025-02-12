import type {Query, QueryClient} from '@tanstack/react-query';

import type {DataSourceOptions} from '../core';

import type {AnyInfiniteQueryDataSource} from './impl/infinite/types';
import type {AnyPlainQueryDataSource} from './impl/plain/types';

export interface QueryDataSourceContext {
    queryClient: QueryClient;
}

export type AnyQueryDataSource = AnyPlainQueryDataSource | AnyInfiniteQueryDataSource;

export type QueryDataOptions<TDataSource extends AnyQueryDataSource> = Omit<
    DataSourceOptions<TDataSource>,
    'refetchInterval'
> & {
    refetchInterval?:
        | number
        | false
        | ((query: Query, count: number) => number | false | undefined);
};
