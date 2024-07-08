export type {QueryDataSourceContext, AnyQueryDataSource} from './types';

export {useQueryContext} from './hooks/useQueryContext';
export {useQueryData} from './hooks/useQueryData';
export {useQueryResponses} from './hooks/useQueryResponses';
export {useRefetchAll} from './hooks/useRefetchAll';
export {useRefetchErrored} from './hooks/useRefetchErrored';

export type {InfiniteQueryDataSource, AnyInfiniteQueryDataSource} from './impl/infinite/types';
export {makeInfiniteQueryDataSource} from './impl/infinite/factory';
export {composeOptions as composeInfiniteQueryOptions} from './impl/infinite/utils';

export type {PlainQueryDataSource, AnyPlainQueryDataSource} from './impl/plain/types';
export {makePlainQueryDataSource} from './impl/plain/factory';
export {composeOptions as composePlainQueryOptions} from './impl/plain/utils';

export {normalizeStatus} from './utils/normalizeStatus';

export type {ClientDataManagerConfig} from './ClientDataManager';
export {ClientDataManager} from './ClientDataManager';
