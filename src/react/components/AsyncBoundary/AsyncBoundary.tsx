import React from 'react';

import type {FallbackProps} from 'react-error-boundary';
import {ErrorBoundary} from 'react-error-boundary';

import type {AsyncBoundaryProps} from './types';

export const AsyncBoundary: React.FC<AsyncBoundaryProps> = ({
    LoadingView,
    ErrorView,
    onReset,
    children,
}) => {
    const fallbackRender = React.useCallback(
        ({error, resetErrorBoundary}: FallbackProps) => (
            <ErrorView error={error} action={{handler: resetErrorBoundary}} />
        ),
        [ErrorView],
    );

    return (
        <ErrorBoundary fallbackRender={fallbackRender} onReset={onReset}>
            <React.Suspense fallback={<LoadingView />}>{children}</React.Suspense>
        </ErrorBoundary>
    );
};
