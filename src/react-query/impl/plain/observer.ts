import type {QueryObserverOptions, QueryObserverResult} from '@tanstack/react-query';
import {QueryObserver} from '@tanstack/react-query';

import type {
    DataListener,
    DataObserver,
    DataSourceContext,
    DataSourceData,
    DataSourceError,
    DataSourceOptions,
    DataSourceParams,
    DataSourceResponse,
} from '../../../core';

import type {AnyPlainQueryDataSource} from './types';
import {composeOptions, transformResult} from './utils';

export class PlainQueryDataObserver<
    TDataSource extends AnyPlainQueryDataSource,
    TContext extends DataSourceContext<TDataSource> = DataSourceContext<TDataSource>,
    TParams extends DataSourceParams<TDataSource> = DataSourceParams<TDataSource>,
    TResponse extends DataSourceResponse<TDataSource> = DataSourceResponse<TDataSource>,
    TData extends DataSourceData<TDataSource> = DataSourceData<TDataSource>,
    TError extends DataSourceError<TDataSource> = DataSourceError<TDataSource>,
    TOptions extends DataSourceOptions<TDataSource> = DataSourceOptions<TDataSource>,
> implements DataObserver<TDataSource>
{
    readonly context: TContext;
    readonly dataSource: TDataSource;
    readonly observer: QueryObserver<TResponse, TError, TData, TResponse>;

    constructor(context: TContext, dataSource: TDataSource, params: TParams, options?: TOptions) {
        this.context = context;
        this.dataSource = dataSource;
        this.observer = new QueryObserver(
            context.queryClient,
            this.composeOptions(context, dataSource, params, options),
        );
    }

    getCurrentState() {
        return this.transformResult(this.observer.getCurrentResult());
    }

    updateParams(params: TParams, options?: TOptions) {
        this.observer.setOptions(
            this.composeOptions(this.context, this.dataSource, params, options),
        );
    }

    subscribe(listener: DataListener<TDataSource>) {
        return this.observer.subscribe((result) => {
            listener(this.transformResult(result));
        });
    }

    private composeOptions(
        context: TContext,
        dataSource: TDataSource,
        params: TParams,
        options?: TOptions,
    ): QueryObserverOptions<TResponse, TError, TData, TResponse> {
        return composeOptions(context, dataSource, params, options);
    }

    private transformResult(result: QueryObserverResult<TData, TError>) {
        return transformResult<TDataSource>(result);
    }
}
