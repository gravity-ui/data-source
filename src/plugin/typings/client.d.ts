import type {ComponentType} from 'react';

declare module '@gravity-ui/data-source' {
    interface AsyncBoundaryComponent<TProps extends object> {
        Lazy: ComponentType<TProps>;
    }

    interface QueryAsyncBoundaryComponent<TProps extends object> {
        Lazy: ComponentType<TProps>;
    }
}
