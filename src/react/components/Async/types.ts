import type {ComponentType, FC, ReactNode} from 'react';

export interface AsyncProps {
    LoadingView: ComponentType;
    children: ReactNode;
}

export interface AsyncComponent<TProps extends object = {}, TLoadingProps extends object = {}>
    extends FC<TProps & TLoadingProps> {
    Content: ComponentType<TProps>;
    Loading: ComponentType<TLoadingProps & Partial<TProps>>;
}
