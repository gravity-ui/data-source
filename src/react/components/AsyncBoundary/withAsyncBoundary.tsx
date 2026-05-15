import React from 'react';

import {AsyncBoundary} from './AsyncBoundary';
import type {AsyncBoundaryComponent, AsyncBoundaryProps} from './types';

export const withAsyncBoundary = <TProps extends object>(
    Component: React.ComponentType<TProps>,
    LoadingView: AsyncBoundaryProps['LoadingView'],
    ErrorView: AsyncBoundaryProps['ErrorView'],
) => {
    const WrappedComponent = ((props: TProps) => (
        <AsyncBoundary LoadingView={LoadingView} ErrorView={ErrorView}>
            <Component {...props} />
        </AsyncBoundary>
    )) as AsyncBoundaryComponent<TProps>;

    WrappedComponent.displayName = `WithAsyncBoundary(${Component.displayName || Component.name})`;

    WrappedComponent.Content = Component;
    WrappedComponent.Loading = LoadingView;
    WrappedComponent.Error = ErrorView;

    return WrappedComponent;
};
