import React from 'react';

import {Async} from './Async';
import type {AsyncComponent} from './types';

export const withAsync = <TProps extends object = {}, TLoadingProps extends object = {}>(
    Component: React.ComponentType<TProps>,
    LoadingView: React.ComponentType<TLoadingProps & Partial<TProps>>,
) => {
    const WrappedComponent = ((props: TProps & TLoadingProps) => (
        <Async LoadingView={() => <LoadingView {...props} />}>
            <Component {...props} />
        </Async>
    )) as AsyncComponent<TProps, TLoadingProps>;

    WrappedComponent.displayName = `WithAsync(${Component.displayName || Component.name})`;

    WrappedComponent.Content = Component;
    WrappedComponent.Loading = LoadingView;

    return WrappedComponent;
};
