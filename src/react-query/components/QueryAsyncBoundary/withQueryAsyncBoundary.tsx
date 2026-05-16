import React from 'react';

import type {ErrorViewProps} from '../../../react';

import {QueryAsyncBoundary} from './QueryAsyncBoundary';
import type {QueryAsyncBoundaryComponent} from './types';

export const withQueryAsyncBoundary = <TProps extends object>(
    Component: React.ComponentType<TProps>,
    LoadingView: React.ComponentType<TProps>,
    ErrorView: React.ComponentType<TProps & ErrorViewProps>,
) => {
    const WrappedComponent = ((props: TProps) => (
        <QueryAsyncBoundary
            LoadingView={() => <LoadingView {...props} />}
            ErrorView={(errorProps) => <ErrorView {...props} {...errorProps} />}
        >
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
