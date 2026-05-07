import type {ComponentType, ReactNode} from 'react';

import type {ErrorViewProps} from '../types';

export interface AsyncBoundaryProps<TError> {
    LoadingView: ComponentType;
    ErrorView: ComponentType<ErrorViewProps<TError>>;
    onReset?: () => void;
    children: ReactNode;
}
