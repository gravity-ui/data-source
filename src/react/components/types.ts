import type {ReactNode} from 'react';

export interface ErrorAction {
    handler: () => unknown;
    children?: ReactNode;
}

export interface ErrorViewProps<TError> {
    error: TError | null;
    action?: ErrorAction;
}
