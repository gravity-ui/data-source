import type {InvalidateOptions} from '@tanstack/react-query';

import type {AnyDataSource, DataSourceParams, DataSourceTag} from './DataSource';

export type RepeatOptions = {
    repeatInterval: number;
    /**
     * Number of repeated calls, not counting the first one
     * @default 2
     */
    count?: number;
};

export type RepeatFunction = (invalidateCallback: () => Promise<void>) => Promise<void>;

export type RepeatProp = RepeatOptions | RepeatFunction;

export type InvalidateDataOptions = InvalidateOptions & {
    repeat?: RepeatProp;
};

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
