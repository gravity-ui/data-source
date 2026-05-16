import React from 'react';

import type {ErrorViewProps} from '../types';

import {AsyncBoundary} from './AsyncBoundary';
import type {AsyncBoundaryComponent} from './types';

export const withAsyncBoundary = <
    TProps extends object = {},
    TLoadingProps extends object = {},
    TErrorProps extends object = {},
>(
    Component: React.ComponentType<TProps>,
    LoadingView: React.ComponentType<TLoadingProps & Partial<TProps>>,
    ErrorView: React.ComponentType<ErrorViewProps & TErrorProps & Partial<TProps>>,
) => {
    const WrappedComponent = ((props: TProps & TLoadingProps & TErrorProps) => (
        <AsyncBoundary
            LoadingView={() => <LoadingView {...props} />}
            ErrorView={(errorProps) => <ErrorView {...props} {...errorProps} />}
        >
            <Component {...props} />
        </AsyncBoundary>
    )) as AsyncBoundaryComponent<TProps, TLoadingProps, TErrorProps>;

    WrappedComponent.displayName = `WithAsyncBoundary(${Component.displayName || Component.name})`;

    WrappedComponent.Content = Component;
    WrappedComponent.Loading = LoadingView;
    WrappedComponent.Error = ErrorView;

    return WrappedComponent;
};
