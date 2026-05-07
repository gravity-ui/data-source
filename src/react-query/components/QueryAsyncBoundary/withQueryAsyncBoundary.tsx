import React from 'react';

import {QueryAsyncBoundary} from './QueryAsyncBoundary';
import type {QueryAsyncBoundaryProps} from './types';

export const withQueryAsyncBoundary = <TProps extends object, TError>(
    Component: React.ComponentType<TProps>,
    LoadingView: QueryAsyncBoundaryProps<TError>['LoadingView'],
    ErrorView: QueryAsyncBoundaryProps<TError>['ErrorView'],
) => {
    const WrappedComponent: React.FC<TProps> = (props) => (
        <QueryAsyncBoundary LoadingView={LoadingView} ErrorView={ErrorView}>
            <Component {...props} />
        </QueryAsyncBoundary>
    );

    WrappedComponent.displayName = `WithQueryAsyncBoundary(${
        Component.displayName || Component.name
    })`;

    return WrappedComponent;
};
