import React from 'react';

import {QueryAsyncBoundary} from './QueryAsyncBoundary';
import type {QueryAsyncBoundaryComponent, QueryAsyncBoundaryProps} from './types';

export const withQueryAsyncBoundary = <TProps extends object>(
    Component: React.ComponentType<TProps>,
    LoadingView: QueryAsyncBoundaryProps['LoadingView'],
    ErrorView: QueryAsyncBoundaryProps['ErrorView'],
) => {
    const WrappedComponent = ((props: TProps) => (
        <QueryAsyncBoundary LoadingView={LoadingView} ErrorView={ErrorView}>
            <Component {...props} />
        </QueryAsyncBoundary>
    )) as QueryAsyncBoundaryComponent<TProps>;

    WrappedComponent.displayName = `WithQueryAsyncBoundary(${
        Component.displayName || Component.name
    })`;

    WrappedComponent.Content = Component;
    WrappedComponent.Loading = LoadingView;
    WrappedComponent.Error = ErrorView;

    return WrappedComponent;
};
