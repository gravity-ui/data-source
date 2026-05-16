import React from 'react';

import type {ErrorViewProps} from '../../../react';

import {QueryAsyncBoundary} from './QueryAsyncBoundary';
import type {QueryAsyncBoundaryComponent} from './types';

export const withQueryAsyncBoundary = <
    TProps extends object = {},
    TLoadingProps extends object = {},
    TErrorProps extends object = {},
>(
    Component: React.ComponentType<TProps>,
    LoadingView: React.ComponentType<TLoadingProps & Partial<TProps>>,
    ErrorView: React.ComponentType<ErrorViewProps & TErrorProps & Partial<TProps>>,
) => {
    const WrappedComponent = ((props: TProps & TLoadingProps & TErrorProps) => (
        <QueryAsyncBoundary
            LoadingView={() => <LoadingView {...props} />}
            ErrorView={(errorProps) => <ErrorView {...props} {...errorProps} />}
        >
            <Component {...props} />
        </QueryAsyncBoundary>
    )) as QueryAsyncBoundaryComponent<TProps, TLoadingProps, TErrorProps>;

    WrappedComponent.displayName = `WithQueryAsyncBoundary(${
        Component.displayName || Component.name
    })`;

    WrappedComponent.Content = Component;
    WrappedComponent.Loading = LoadingView;
    WrappedComponent.Error = ErrorView;

    return WrappedComponent;
};
