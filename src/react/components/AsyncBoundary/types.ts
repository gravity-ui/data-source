import type {ComponentType, ReactNode} from 'react';

import type {ErrorViewProps} from '../types';

export interface AsyncBoundaryProps {
    LoadingView: ComponentType;
    ErrorView: ComponentType<ErrorViewProps>;
    onReset?: () => void;
    children: ReactNode;
}

export interface AsyncBoundaryComponent<TProps extends object> extends React.FC<TProps> {
    Content: React.ComponentType<TProps>;
    Loading: AsyncBoundaryProps['LoadingView'];
    Error: AsyncBoundaryProps['ErrorView'];
}
