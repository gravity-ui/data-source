import type {ComponentType, ReactNode} from 'react';

import type {DataLoaderStatus} from '../../../core';
import type {ErrorAction, ErrorViewProps} from '../types';

export interface MoreViewProps {
    isLoading: boolean;
    onClick: () => void;
}

export interface DataInfiniteLoaderProps<
    TError,
    TLoadingViewProps extends object = {},
    TErrorViewProps extends ErrorViewProps<TError> = ErrorViewProps<TError>,
    TMoreViewProps extends MoreViewProps = MoreViewProps,
> {
    status: DataLoaderStatus;
    error: TError | null;
    errorAction?: ErrorAction | ErrorAction['handler'];
    hasNextPage: boolean;
    fetchNextPage: () => unknown;
    isFetchingNextPage: boolean;
    LoadingView: ComponentType<TLoadingViewProps>;
    ErrorView: ComponentType<TErrorViewProps>;
    MoreView: ComponentType<TMoreViewProps>;
    loadingViewProps?: TLoadingViewProps;
    errorViewProps?: Omit<TErrorViewProps, keyof ErrorViewProps<TError>>;
    moreViewProps?: Omit<TMoreViewProps, keyof MoreViewProps>;
    children: ReactNode;
}
