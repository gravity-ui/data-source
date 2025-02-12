import type {InvalidateDataOptions} from './DataManagerOptions';
import type {AnyDataSource, DataSourceParams, DataSourceTag} from './DataSource';

export interface DataManager {
    invalidateTag(tag: DataSourceTag, invalidateOptions?: InvalidateDataOptions): Promise<void>;
    invalidateTags(tags: DataSourceTag[], invalidateOptions?: InvalidateDataOptions): Promise<void>;

    invalidateSource<TDataSource extends AnyDataSource>(
        dataSource: TDataSource,
        invalidateOptions?: InvalidateDataOptions,
    ): Promise<void>;

    resetSource<TDataSource extends AnyDataSource>(dataSource: TDataSource): Promise<void>;

    invalidateParams<TDataSource extends AnyDataSource>(
        dataSource: TDataSource,
        params: DataSourceParams<TDataSource>,
        invalidateOptions?: InvalidateDataOptions,
    ): Promise<void>;

    resetParams<TDataSource extends AnyDataSource>(
        dataSource: TDataSource,
        params: DataSourceParams<TDataSource>,
    ): Promise<void>;

    invalidateSourceTags<TDataSource extends AnyDataSource>(
        dataSource: TDataSource,
        params: DataSourceParams<TDataSource>,
        invalidateOptions?: InvalidateDataOptions,
    ): Promise<void>;
}
