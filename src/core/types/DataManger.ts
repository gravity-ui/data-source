import type {AnyDataSource, DataSourceParams, DataSourceTag} from './DataSource';

export interface DataManager {
    invalidateTag(tag: DataSourceTag): Promise<void>;
    invalidateTags(tags: DataSourceTag[]): Promise<void>;

    invalidateSource<TDataSource extends AnyDataSource>(dataSource: TDataSource): Promise<void>;

    resetSource<TDataSource extends AnyDataSource>(dataSource: TDataSource): Promise<void>;

    invalidateParams<TDataSource extends AnyDataSource>(
        dataSource: TDataSource,
        params: DataSourceParams<TDataSource>,
    ): Promise<void>;

    resetParams<TDataSource extends AnyDataSource>(
        dataSource: TDataSource,
        params: DataSourceParams<TDataSource>,
    ): Promise<void>;

    invalidateSourceTags<TDataSource extends AnyDataSource>(
        dataSource: TDataSource,
        params: DataSourceParams<TDataSource>,
    ): Promise<void>;
}
