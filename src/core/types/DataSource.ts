import type {idle} from '../constants';

export type DataSourceKey = readonly unknown[];
export type DataSourceTag = string;

declare const errorHintSymbol: unique symbol;
declare const stateHintSymbol: unique symbol;

export interface DataSource<
    TContext,
    TParams,
    TRequest,
    TResponse,
    TData,
    TError,
    TOptions,
    TState,
    TFetchContext,
> {
    readonly name: string;

    fetch: (
        context: TContext,
        fetchContext: TFetchContext,
        request: TRequest,
    ) => Promise<TResponse> | TResponse;
    observe: (
        context: TContext,
        params: ActualParams<this, TParams, TRequest>,
        options?: TOptions,
    ) => DataObserver<this>;
    tags?: (params: ActualParams<this, TParams, TRequest>) => DataSourceTag[];

    transformParams?: (params: TParams) => TRequest;
    transformResponse?: (response: TResponse) => TData;

    [errorHintSymbol]?: TError;

    options?: TOptions;
    [stateHintSymbol]?: TState;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyDataSource = DataSource<any, any, any, any, any, any, any, any, any>;

export interface DataObserver<TDataSource extends AnyDataSource> {
    getCurrentState(): DataSourceState<TDataSource>;
    updateParams(
        params: DataSourceParams<TDataSource>,
        options?: DataSourceOptions<TDataSource>,
    ): void;
    subscribe(listener: DataListener<TDataSource>): () => void;
}

export type DataListener<TDataSource extends AnyDataSource> = (
    state: DataSourceState<TDataSource>,
) => void;

export type DataSourceContext<TDataSource> =
    TDataSource extends DataSource<
        infer TContext,
        infer _TParams,
        infer _TRequest,
        infer _TResponse,
        infer _TData,
        infer _TError,
        infer _TOptions,
        infer _TState,
        infer _TFetchContext
    >
        ? TContext
        : never;

export type DataSourceParams<TDataSource> =
    TDataSource extends DataSource<
        infer _TContenxt,
        infer TParams,
        infer TRequest,
        infer _TResponse,
        infer _TData,
        infer _TError,
        infer _TOptions,
        infer _TState,
        infer _TFetchContext
    >
        ? ActualParams<TDataSource, TParams, TRequest>
        : never;

export type DataSourceRequest<TDataSource> =
    TDataSource extends DataSource<
        infer _TContenxt,
        infer _TParams,
        infer TRequest,
        infer _TResponse,
        infer _TData,
        infer _TError,
        infer _TOptions,
        infer _TState,
        infer _TFetchContext
    >
        ? TRequest
        : never;

export type DataSourceResponse<TDataSource> =
    TDataSource extends DataSource<
        infer _TContenxt,
        infer _TParams,
        infer _TRequest,
        infer TResponse,
        infer _TData,
        infer _TError,
        infer _TOptions,
        infer _TState,
        infer _TFetchContext
    >
        ? TResponse
        : never;

export type DataSourceData<TDataSource> =
    TDataSource extends DataSource<
        infer _TContenxt,
        infer _TParams,
        infer _TRequest,
        infer TResponse,
        infer TData,
        infer _TError,
        infer _TOptions,
        infer _TState,
        infer _TFetchContext
    >
        ? ActualData<TData, TResponse>
        : never;

export type DataSourceError<TDataSource> =
    TDataSource extends DataSource<
        infer _TContenxt,
        infer _TParams,
        infer _TRequest,
        infer _TResponse,
        infer _TData,
        infer TError,
        infer _TOptions,
        infer _TState,
        infer _TFetchContext
    >
        ? TError
        : never;

export type DataSourceOptions<TDataSource> =
    TDataSource extends DataSource<
        infer _TContenxt,
        infer _TParams,
        infer _TRequest,
        infer _TResponse,
        infer _TData,
        infer _TError,
        infer TOptions,
        infer _TState,
        infer _TFetchContext
    >
        ? TOptions
        : never;

export type DataSourceState<TDataSource> =
    TDataSource extends DataSource<
        infer _TContenxt,
        infer _TParams,
        infer _TRequest,
        infer _TResponse,
        infer _TData,
        infer _TError,
        infer _TOptions,
        infer TState,
        infer _TFetchContext
    >
        ? TState
        : never;

export type DataSourceFetchContext<TDataSource> =
    TDataSource extends DataSource<
        infer _TContenxt,
        infer _TParams,
        infer _TRequest,
        infer _TResponse,
        infer _TData,
        infer _TError,
        infer _TOptions,
        infer _TState,
        infer TFetchContext
    >
        ? TFetchContext
        : never;

export type ActualParams<TDataSource extends AnyDataSource, TParams, TRequest> =
    | (unknown extends TParams
          ? TRequest
          : undefined extends TDataSource['transformParams']
            ? TRequest
            : TParams)
    | typeof idle;

export type ActualData<TData, TResponse> = unknown extends TData ? TResponse : TData;
