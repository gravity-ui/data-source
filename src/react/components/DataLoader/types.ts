import type {ComponentType, ReactNode} from 'react';

import type {DataLoaderStatus} from '../../../core';
import type {ErrorAction, ErrorViewProps} from '../types';

export interface DataLoaderProps<
    TError,
    TLoadingViewProps extends {} = {},
    TErrorViewProps extends ErrorViewProps<TError> = ErrorViewProps<TError>,
> {
    status: DataLoaderStatus;
    error: TError | null;
    errorAction?: ErrorAction | ErrorAction['handler'];
    LoadingView: ComponentType<TLoadingViewProps>;
    ErrorView: ComponentType<TErrorViewProps>;
    loadingViewProps?: TLoadingViewProps;
    errorViewProps?: Omit<TErrorViewProps, keyof ErrorViewProps<TError>>;
    children: ReactNode;
}
