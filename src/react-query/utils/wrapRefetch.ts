import type {QueryObserverResult, RefetchOptions} from '@tanstack/react-query';

export function wrapRefetch<TData, TError>(
    refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<TData, TError>>,
    onRefetch?: () => void,
): (options?: RefetchOptions) => Promise<void> {
    return async (options?: RefetchOptions) => {
        onRefetch?.();

        await refetch(options);
    };
}
