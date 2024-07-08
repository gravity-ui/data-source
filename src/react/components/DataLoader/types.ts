import type {ComponentType, ReactNode} from 'react';

import type {DataLoaderStatus} from '../../../core';
import type {ErrorAction, ErrorViewProps} from '../types';

export interface DataLoaderProps<TError> {
    status: DataLoaderStatus;
    error: TError | null;
    errorAction?: ErrorAction | ErrorAction['handler'];
    LoadingView: ComponentType;
    ErrorView: ComponentType<ErrorViewProps<TError>>;
    children: ReactNode;
}
