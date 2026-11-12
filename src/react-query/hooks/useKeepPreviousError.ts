import React from 'react';

import {hashKey} from '@tanstack/react-query';
import type {QueryKey, QueryObserverResult} from '@tanstack/react-query';

interface KeptError<TError> {
    key: string;
    error: TError;
}

export const useKeepPreviousError = <TData, TError>(
    enabled: boolean | undefined,
    state: QueryObserverResult<TData, TError>,
    queryKey: QueryKey,
): {state: QueryObserverResult<TData, TError>; forget: () => void} => {
    const keptError = React.useRef<KeptError<TError> | null>(null);
    const forgotten = React.useRef(false);
    const [, rerender] = React.useReducer((value: number) => value + 1, 0);
    const key = hashKey(queryKey);

    const forget = React.useCallback(() => {
        if (!keptError.current) {
            return;
        }

        keptError.current = null;
        forgotten.current = true;
        rerender();
    }, []);

    if (!enabled || keptError.current?.key !== key) {
        keptError.current = null;
    }

    if (state.status !== 'error') {
        forgotten.current = false;
    }

    if (enabled && state.status === 'error' && !forgotten.current) {
        keptError.current = {key, error: state.error};
    } else if (state.status === 'success') {
        keptError.current = null;
    }

    if (enabled && state.status === 'pending' && keptError.current) {
        return {
            state: {
                ...state,
                status: 'error',
                error: keptError.current.error,
                isError: true,
                isPending: false,
                isSuccess: false,
                isLoading: false,
                isInitialLoading: false,
                isLoadingError: true,
                isRefetchError: false,
                isRefetching: state.isFetching,
            },
            forget,
        };
    }

    return {state, forget};
};
