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

// Returns a view of the query whose `state.data` is replaced with `parseQueryData(state.data)`.
// The original query is returned untouched when parsing changes nothing, so the common path
// stays allocation-free. Methods are bound to the original query because `Query` relies on
// private class fields, which are not reachable through a proxy receiver.
const withParsedQueryData = <TQueryFnData, TError, TQueryData, TQueryKey extends QueryKey>(
    query: Query<TQueryFnData, TError, TQueryData, TQueryKey>,
    parseQueryData: (data: unknown) => unknown,
): Query<TQueryFnData, TError, TQueryData, TQueryKey> => {
    const data = query.state.data;
    const parsedData = parseQueryData(data);

    if (parsedData === data) {
        return query;
    }

    const state = {...query.state, data: parsedData};

    return new Proxy(query, {
        get(target, property) {
            if (property === 'state') {
                return state;
            }

            const value = Reflect.get(target, property, target);

            return typeof value === 'function' ? value.bind(target) : value;
        },
    });
};

export const useRefetchInterval = <
    TQueryFnData = unknown,
    TError = DefaultError,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = never,
>(
    refetchInterval?: RefetchInterval<TQueryFnData, TError, TQueryData, TQueryKey>,
    queryFn?: QueryFunction<TQueryFnData, TQueryKey, TPageParam> | SkipToken,
    /**
     * Maps the raw cached data to what the user-facing `refetchInterval` callback should see,
     * e.g. unwraps the internal nullable placeholders back into `null` / `undefined`.
     */
    parseQueryData?: (data: unknown) => unknown,
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
                const actualQuery = parseQueryData
                    ? withParsedQueryData(query, parseQueryData)
                    : query;

                return refetchInterval(actualQuery, count.current);
            }) satisfies UseRefetchIntervalResult<
                TQueryFnData,
                TError,
                TQueryData,
                TQueryKey,
                TPageParam
            >['refetchInterval'];
        }

        return refetchInterval;
    }, [refetchInterval, parseQueryData]);

    return {queryFn: actualQueryFn, refetchInterval: actualRefetchInterval};
};
