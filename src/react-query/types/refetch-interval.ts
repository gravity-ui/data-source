import type {DefaultError, Query, QueryKey} from '@tanstack/react-query';

export type RefetchIntervalFunction<
    TQueryFnData = unknown,
    TError = DefaultError,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
> = (
    query: Query<TQueryFnData, TError, TQueryData, TQueryKey>,
    count: number,
) => number | false | undefined;

export type RefetchInterval<
    TQueryFnData = unknown,
    TError = DefaultError,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
> = number | false | RefetchIntervalFunction<TQueryFnData, TError, TQueryData, TQueryKey>;

export interface ProgressiveRefetchInterval {
    minInterval: number;
    maxInterval: number;
}

export interface QueryDataExtendedOptions<
    TQueryFnData = unknown,
    TError = DefaultError,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
> {
    refetchInterval?: RefetchInterval<TQueryFnData, TError, TQueryData, TQueryKey>;
}
