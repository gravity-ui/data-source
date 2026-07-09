import React from 'react';

import type {ErrorBoundaryProps} from 'react-error-boundary';
import {ErrorBoundary} from 'react-error-boundary';

import {Async} from '../Async';

import type {AsyncBoundaryProps} from './types';

export const AsyncBoundary: React.FC<AsyncBoundaryProps> = ({
    LoadingView,
    ErrorView,
    onReset,
    children,
}) => {
    const fallbackRender = React.useCallback<NonNullable<ErrorBoundaryProps['fallbackRender']>>(
        ({error, resetErrorBoundary}) => (
            <ErrorView error={error} action={{handler: resetErrorBoundary}} />
        ),
        [ErrorView],
    );

    return (
        <ErrorBoundary fallbackRender={fallbackRender} onReset={onReset}>
            <Async LoadingView={LoadingView}>{children}</Async>
        </ErrorBoundary>
    );
};
