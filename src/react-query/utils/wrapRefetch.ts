import type {QueryObserverResult, RefetchOptions} from '@tanstack/react-query';

export function wrapRefetch<TData, TError>(
    refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<TData, TError>>,
): (options?: RefetchOptions) => Promise<void> {
    return async (options?: RefetchOptions) => {
        await refetch(options);
    };
}
