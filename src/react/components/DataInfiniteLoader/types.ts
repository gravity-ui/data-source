import type {ComponentType, ReactNode} from 'react';

import type {DataLoaderStatus} from '../../../core';
import type {ErrorAction, ErrorViewProps} from '../types';

export interface MoreViewProps {
    isLoading: boolean;
    onClick: () => void;
}

export interface DataInfiniteLoaderProps<TError> {
    status: DataLoaderStatus;
    error: TError | null;
    errorAction?: ErrorAction | ErrorAction['handler'];
    hasNextPage: boolean;
    fetchNextPage: () => unknown;
    isFetchingNextPage: boolean;
    LoadingView: ComponentType;
    ErrorView: ComponentType<ErrorViewProps<TError>>;
    MoreView: ComponentType<MoreViewProps>;
    children: ReactNode;
}
