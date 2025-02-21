import type {DefaultError, QueryKey} from '@tanstack/react-query';

import type {ProgressiveRefetchInterval, RefetchIntervalFunction} from '../types';

const BASE = 2;

export const getProgressiveRefetch = <
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
>({
    minInterval,
    maxInterval,
}: ProgressiveRefetchInterval): RefetchIntervalFunction<TQueryFnData, TError, TData, TQueryKey> => {
    return (_, queryRefetchCount) => {
        return Math.min(minInterval * BASE ** queryRefetchCount, maxInterval);
    };
};
