import React from 'react';

import type {ErrorViewProps} from '../types';

import {AsyncBoundary} from './AsyncBoundary';
import type {AsyncBoundaryComponent} from './types';

export const withAsyncBoundary = <TProps extends object>(
    Component: React.ComponentType<TProps>,
    LoadingView: React.ComponentType<TProps>,
    ErrorView: React.ComponentType<TProps & ErrorViewProps>,
) => {
    const WrappedComponent = ((props: TProps) => (
        <AsyncBoundary
            LoadingView={() => <LoadingView {...props} />}
            ErrorView={(errorProps) => <ErrorView {...props} {...errorProps} />}
        >
            <Component {...props} />
        </AsyncBoundary>
    )) as AsyncBoundaryComponent<TProps>;

    WrappedComponent.displayName = `WithAsyncBoundary(${Component.displayName || Component.name})`;

    WrappedComponent.Content = Component;
    WrappedComponent.Loading = LoadingView;
    WrappedComponent.Error = ErrorView;

    return WrappedComponent;
};
