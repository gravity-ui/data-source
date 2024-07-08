import type {QueryClient} from '@tanstack/react-query';

import type {AnyInfiniteQueryDataSource} from './impl/infinite/types';
import type {AnyPlainQueryDataSource} from './impl/plain/types';

export interface QueryDataSourceContext {
    queryClient: QueryClient;
}

export type AnyQueryDataSource = AnyPlainQueryDataSource | AnyInfiniteQueryDataSource;
