import type {DefaultError, QueryKey} from '@tanstack/react-query';

import type {RefetchIntervalFunction} from '../types/refetch-interval';

export interface ProgressiveRefetchOptions {
    minInterval: number;
    maxInterval: number;
    multiplier?: number;
}

export const getProgressiveRefetch = <
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
>({
    minInterval,
    maxInterval,
    multiplier = 2,
}: ProgressiveRefetchOptions): RefetchIntervalFunction<TQueryFnData, TError, TData, TQueryKey> => {
    return (_query, count) => {
        return Math.min(minInterval * multiplier ** count, maxInterval);
    };
};
