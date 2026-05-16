import type {ComponentType} from 'react';

import type {AsyncBoundaryProps, ErrorViewProps} from '../../../react';

export interface QueryAsyncBoundaryProps extends AsyncBoundaryProps {}

export interface QueryAsyncBoundaryComponent<
    TProps extends object = {},
    TLoadingProps extends object = {},
    TErrorProps extends object = {},
> extends React.FC<TProps & TLoadingProps & Omit<TErrorProps, keyof ErrorViewProps>> {
    Content: React.ComponentType<TProps>;
    Loading: ComponentType<TLoadingProps & Partial<TProps>>;
    Error: ComponentType<ErrorViewProps & TErrorProps & Partial<TProps>>;
}
