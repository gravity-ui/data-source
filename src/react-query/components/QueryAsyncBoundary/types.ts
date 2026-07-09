import type {ComponentType, FC} from 'react';

import type {AsyncBoundaryProps, ErrorViewProps} from '../../../react';

export interface QueryAsyncBoundaryProps extends AsyncBoundaryProps {}

export interface QueryAsyncBoundaryComponent<
    TProps extends object = {},
    TLoadingProps extends object = {},
    TErrorProps extends object = {},
> extends FC<TProps & TLoadingProps & Omit<TErrorProps, keyof ErrorViewProps>> {
    Content: ComponentType<TProps>;
    Loading: ComponentType<TLoadingProps & Partial<TProps>>;
    Error: ComponentType<ErrorViewProps & TErrorProps & Partial<TProps>>;
}
