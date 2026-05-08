import React from 'react';

import {QueryAsyncBoundary} from './QueryAsyncBoundary';
import type {QueryAsyncBoundaryProps} from './types';

export const withQueryAsyncBoundary = <TProps extends object, TError>(
    Component: React.ComponentType<TProps>,
    LoadingView: QueryAsyncBoundaryProps<TError>['LoadingView'],
    ErrorView: QueryAsyncBoundaryProps<TError>['ErrorView'],
) => {
    const WrappedComponent: React.FC<TProps> & {
        Content: React.ComponentType<TProps>;
        Loading: QueryAsyncBoundaryProps<TError>['LoadingView'];
        Error: QueryAsyncBoundaryProps<TError>['ErrorView'];
    } = (props) => (
        <QueryAsyncBoundary LoadingView={LoadingView} ErrorView={ErrorView}>
            <Component {...props} />
        </QueryAsyncBoundary>
    );

    WrappedComponent.displayName = `WithQueryAsyncBoundary(${
        Component.displayName || Component.name
    })`;

    WrappedComponent.Content = Component;
    WrappedComponent.Loading = LoadingView;
    WrappedComponent.Error = ErrorView;

    return WrappedComponent;
};
