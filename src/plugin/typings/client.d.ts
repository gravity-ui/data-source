import type {ComponentType} from 'react';

declare module '@gravity-ui/data-source' {
    interface AsyncBoundaryComponent<
        TProps extends object = {},
        TLoadingProps extends object = {},
        TErrorProps extends object = {},
    > {
        Lazy: ComponentType<TProps & TLoadingProps & Omit<TErrorProps, keyof ErrorViewProps>>;
    }

    interface QueryAsyncBoundaryComponent<
        TProps extends object = {},
        TLoadingProps extends object = {},
        TErrorProps extends object = {},
    > {
        Lazy: ComponentType<TProps & TLoadingProps & Omit<TErrorProps, keyof ErrorViewProps>>;
    }
}
