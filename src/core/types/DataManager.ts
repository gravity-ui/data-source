import type {Data} from '@normy/core';

import type {InvalidateOptions} from './DataManagerOptions';
import type {AnyDataSource, DataSourceParams, DataSourceTag} from './DataSource';
import type {Normalizer} from './Normalizer';

export interface DataManager {
    normalizer?: Normalizer;

    optimisticUpdate(mutationData: Data): void;

    automaticInvalidate(data: Data): void;

    invalidateTag(tag: DataSourceTag, invalidateOptions?: InvalidateOptions): Promise<void>;

    invalidateTags(tags: DataSourceTag[], invalidateOptions?: InvalidateOptions): Promise<void>;

    invalidateSource<TDataSource extends AnyDataSource>(
        dataSource: TDataSource,
        invalidateOptions?: InvalidateOptions,
    ): Promise<void>;

    resetSource<TDataSource extends AnyDataSource>(dataSource: TDataSource): Promise<void>;

    invalidateParams<TDataSource extends AnyDataSource>(
        dataSource: TDataSource,
        params: DataSourceParams<TDataSource>,
        invalidateOptions?: InvalidateOptions,
    ): Promise<void>;

    resetParams<TDataSource extends AnyDataSource>(
        dataSource: TDataSource,
        params: DataSourceParams<TDataSource>,
    ): Promise<void>;

    invalidateSourceTags<TDataSource extends AnyDataSource>(
        dataSource: TDataSource,
        params: DataSourceParams<TDataSource>,
        invalidateOptions?: InvalidateOptions,
    ): Promise<void>;
}
