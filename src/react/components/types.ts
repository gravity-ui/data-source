import type {ReactNode} from 'react';

export interface ErrorAction {
    handler: () => unknown;
    children?: ReactNode;
}

export interface ErrorViewProps<TError = unknown> {
    error: TError | null;
    action?: ErrorAction;
}
