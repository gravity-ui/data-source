import React from 'react';

import type {ErrorViewProps} from '../types';

import type {DataLoaderProps} from './types';

export const DataLoader = <TError,>({
    status,
    error,
    errorAction: errorActionProp,
    LoadingView,
    ErrorView,
    children,
}: DataLoaderProps<TError>): React.ReactNode => {
    const errorAction = React.useMemo<ErrorViewProps<TError>['action']>(
        () =>
            typeof errorActionProp === 'function' ? {handler: errorActionProp} : errorActionProp,
        [errorActionProp],
    );

    if (status === 'loading') {
        return <LoadingView />;
    }

    if (status === 'error') {
        return <ErrorView error={error} action={errorAction} />;
    }

    return <>{children}</>;
};
