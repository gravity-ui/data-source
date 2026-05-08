import React from 'react';

import {AsyncBoundary} from './AsyncBoundary';
import type {AsyncBoundaryProps} from './types';

export const withAsyncBoundary = <TProps extends object>(
    Component: React.ComponentType<TProps>,
    LoadingView: AsyncBoundaryProps['LoadingView'],
    ErrorView: AsyncBoundaryProps['ErrorView'],
) => {
    const WrappedComponent: React.FC<TProps> & {
        Content: React.ComponentType<TProps>;
        Loading: AsyncBoundaryProps['LoadingView'];
        Error: AsyncBoundaryProps['ErrorView'];
    } = (props) => (
        <AsyncBoundary LoadingView={LoadingView} ErrorView={ErrorView}>
            <Component {...props} />
        </AsyncBoundary>
    );

    WrappedComponent.displayName = `WithAsyncBoundary(${Component.displayName || Component.name})`;

    WrappedComponent.Content = Component;
    WrappedComponent.Loading = LoadingView;
    WrappedComponent.Error = ErrorView;

    return WrappedComponent;
};
