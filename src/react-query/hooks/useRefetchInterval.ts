import React from 'react';

import type {
    DefaultError,
    InfiniteData,
    Query,
    QueryFunction,
    QueryFunctionContext,
    QueryKey,
    SkipToken,
} from '@tanstack/react-query';

import type {RefetchInterval} from '../types';

export const useRefetchInterval = <
    TQueryFnData = unknown,
    TError = DefaultError,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = unknown,
>(
    refetchIntervalOption?: RefetchInterval<
        TQueryFnData,
        TError,
        TQueryData,
        TQueryKey,
        TPageParam
    >,
    queryFnOption?: QueryFunction<TQueryFnData, TQueryKey, TPageParam> | SkipToken,
): {
    refetchInterval?:
        | number
        | false
        | ((
              query:
                  | Query<TQueryFnData, TError, TQueryData, TQueryKey>
                  | Query<TQueryFnData, TError, InfiniteData<TQueryData, TPageParam>, TQueryKey>,
          ) => number | false | undefined);
    queryFn?: QueryFunction<TQueryFnData, TQueryKey, TPageParam> | SkipToken;
} => {
    const count = React.useRef<number>(0);

    const queryFn = React.useMemo(() => {
        if (typeof queryFnOption === 'function') {
            return (context: QueryFunctionContext<TQueryKey, TPageParam>) => {
                count.current++;
                return queryFnOption(context);
            };
        }
        return undefined;
    }, [queryFnOption]);

    const refetchInterval = React.useMemo(() => {
        if (typeof refetchIntervalOption === 'function') {
            return (
                query:
                    | Query<TQueryFnData, TError, TQueryData, TQueryKey>
                    | Query<TQueryFnData, TError, InfiniteData<TQueryData, TPageParam>, TQueryKey>,
            ) => {
                return refetchIntervalOption(query, count.current);
            };
        }
        return refetchIntervalOption;
    }, [refetchIntervalOption]);

    return {refetchInterval, queryFn};
};
