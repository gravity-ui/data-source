import type {AnyDataSource} from '../types/DataSource';

export interface Cancellable {
    cancel: () => void;
}

export const isCancellable = (value: unknown): value is Cancellable => {
    return (
        typeof value === 'object' &&
        value !== null &&
        'cancel' in value &&
        typeof value.cancel === 'function'
    );
};

export const isAbortable = (value: unknown): value is {signal: AbortSignal} => {
    return (
        typeof value === 'object' &&
        value !== null &&
        'signal' in value &&
        typeof value.signal === 'object' &&
        value.signal !== null &&
        'addEventListener' in value.signal &&
        typeof value.signal.addEventListener === 'function'
    );
};

export const withCancellation = <TDataSource extends AnyDataSource>(
    fetch: TDataSource['fetch'],
): TDataSource['fetch'] => {
    return (context, fetchContext, request) => {
        const value = fetch(context, fetchContext, request);

        if (isAbortable(fetchContext) && isCancellable(value)) {
            fetchContext.signal.addEventListener('abort', () => {
                value.cancel();
            });
        }

        return value;
    };
};
