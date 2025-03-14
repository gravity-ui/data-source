import React from 'react';

import type {DefaultError, Query, QueryFunction, QueryKey, SkipToken} from '@tanstack/react-query';

import type {RefetchInterval} from '../types/refetch-interval';

export interface UseRefetchIntervalResult<
    TQueryFnData = unknown,
    TError = DefaultError,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = never,
> {
    refetchInterval?:
        | number
        | false
        | ((
              query: Query<TQueryFnData, TError, TQueryData, TQueryKey>,
          ) => number | false | undefined);
    queryFn?: QueryFunction<TQueryFnData, TQueryKey, TPageParam> | SkipToken;
}

export const useRefetchInterval = <
    TQueryFnData = unknown,
    TError = DefaultError,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = never,
>(
    refetchInterval?: RefetchInterval<TQueryFnData, TError, TQueryData, TQueryKey>,
    queryFn?: QueryFunction<TQueryFnData, TQueryKey, TPageParam> | SkipToken,
): UseRefetchIntervalResult<TQueryFnData, TError, TQueryData, TQueryKey, TPageParam> => {
    const count = React.useRef<number>(0);

    const actualQueryFn = React.useMemo(() => {
        if (typeof queryFn === 'function') {
            return ((context) => {
                ++count.current;
                return queryFn(context);
            }) satisfies UseRefetchIntervalResult<
                TQueryFnData,
                TError,
                TQueryData,
                TQueryKey,
                TPageParam
            >['queryFn'];
        }

        return queryFn;
    }, [queryFn]);

    const actualRefetchInterval = React.useMemo(() => {
        if (typeof refetchInterval === 'function') {
            return ((query) => {
                return refetchInterval(query, count.current);
            }) satisfies UseRefetchIntervalResult<
                TQueryFnData,
                TError,
                TQueryData,
                TQueryKey,
                TPageParam
            >['refetchInterval'];
        }

        return refetchInterval;
    }, [refetchInterval]);

    return {queryFn: actualQueryFn, refetchInterval: actualRefetchInterval};
};
