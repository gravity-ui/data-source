import type {DefaultError, InfiniteData, Query, QueryKey} from '@tanstack/react-query';

export type RefetchIntervalFunction<
    TQueryFnData = unknown,
    TError = DefaultError,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = never,
> = (
    query:
        | Query<TQueryFnData, TError, TQueryData, TQueryKey>
        | Query<TQueryFnData, TError, InfiniteData<TQueryData, TPageParam>, TQueryKey>,
    count: number,
) => number | false | undefined;

export type RefetchInterval<
    TQueryFnData = unknown,
    TError = DefaultError,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = never,
> =
    | number
    | false
    | RefetchIntervalFunction<TQueryFnData, TError, TQueryData, TQueryKey, TPageParam>;

export interface ProgressiveRefetchInterval {
    minInterval: number;
    maxInterval: number;
}

export interface QueryDataExtendedOptions<
    TQueryFnData = unknown,
    TError = DefaultError,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = never,
> {
    refetchInterval?: RefetchInterval<TQueryFnData, TError, TQueryData, TQueryKey, TPageParam>;
}
