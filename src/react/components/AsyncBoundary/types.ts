import type {ComponentType, ReactNode} from 'react';

import type {ErrorViewProps} from '../types';

export interface AsyncBoundaryProps {
    LoadingView: ComponentType;
    ErrorView: ComponentType<ErrorViewProps>;
    onReset?: () => void;
    children: ReactNode;
}
