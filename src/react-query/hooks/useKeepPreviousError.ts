import React from 'react';

import type {DataLoaderStatus} from '../../core';

export interface UseKeepPreviousErrorResult<TError> {
    status: DataLoaderStatus;
    error: TError | null;
    /** Forgets the kept error, so the next loading state is shown as usual. */
    forget: () => void;
}

interface KeptError<TError> {
    error: TError;
    errorUpdatedAt: number;
}

/**
 * Keeps the error already shown on the screen while the failed query is being retried.
 *
 * A query that has never resolved has no data, so react-query resets its state to `pending`
 * every time the query starts again. The error is wiped at that moment, and a refetch triggered
 * by an interval, a window focus or a reconnect replaces the error view with a loading view for
 * the duration of the request. `errorUpdatedAt` survives that reset and is zero for a query that
 * has not failed yet, which tells a retry of the same error apart from the first load of another
 * query.
 *
 * @param enabled - whether the error should be kept while the query is retried
 * @param status - normalized status of the query
 * @param error - current error of the query
 * @param errorUpdatedAt - timestamp of the last error of the query
 * @returns status and error to render, and a callback that forgets the kept error
 */
export const useKeepPreviousError = <TError>(
    enabled: boolean | undefined,
    status: DataLoaderStatus,
    error: TError | null,
    errorUpdatedAt: number,
): UseKeepPreviousErrorResult<TError> => {
    const keptError = React.useRef<KeptError<TError> | null>(null);

    const forget = React.useCallback(() => {
        keptError.current = null;
    }, []);

    if (!enabled) {
        keptError.current = null;

        return {status, error, forget};
    }

    if (error) {
        keptError.current = {error, errorUpdatedAt};
    } else if (status === 'success') {
        keptError.current = null;
    }

    const kept = keptError.current;

    if (status === 'loading' && kept && kept.errorUpdatedAt === errorUpdatedAt) {
        return {status: 'error', error: kept.error, forget};
    }

    return {status, error, forget};
};
