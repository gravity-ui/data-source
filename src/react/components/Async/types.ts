import type {ComponentType, ReactNode} from 'react';

export interface AsyncProps {
    LoadingView: ComponentType;
    children: ReactNode;
}

export interface AsyncComponent<TProps extends object = {}, TLoadingProps extends object = {}>
    extends React.FC<TProps & TLoadingProps> {
    Content: React.ComponentType<TProps>;
    Loading: ComponentType<TLoadingProps & Partial<TProps>>;
}
