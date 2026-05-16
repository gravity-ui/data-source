import type {ComponentType, ReactNode} from 'react';

import type {ErrorViewProps} from '../types';

export interface AsyncBoundaryProps {
    LoadingView: ComponentType;
    ErrorView: ComponentType<ErrorViewProps>;
    onReset?: () => void;
    children: ReactNode;
}

export interface AsyncBoundaryComponent<
    TProps extends object = {},
    TLoadingProps extends object = {},
    TErrorProps extends object = {},
> extends React.FC<TProps & TLoadingProps & Omit<TErrorProps, keyof ErrorViewProps>> {
    Content: React.ComponentType<TProps>;
    Loading: ComponentType<TLoadingProps & Partial<TProps>>;
    Error: ComponentType<ErrorViewProps & TErrorProps & Partial<TProps>>;
}
