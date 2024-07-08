import React from 'react';

import type {ErrorViewProps} from '../types';

import type {DataInfiniteLoaderProps} from './types';

export const DataInfiniteLoader = <TError,>({
    status,
    error,
    errorAction: errorActionProp,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    LoadingView,
    ErrorView,
    MoreView,
    children,
}: DataInfiniteLoaderProps<TError>): React.ReactNode => {
    const errorAction = React.useMemo<ErrorViewProps<TError>['action']>(
        () =>
            typeof errorActionProp === 'function' ? {handler: errorActionProp} : errorActionProp,
        [errorActionProp],
    );

    const content = React.useMemo(() => {
        if (status === 'loading') {
            return <LoadingView />;
        }

        if (status === 'error') {
            return <ErrorView error={error} action={errorAction} />;
        }

        if (status === 'success' && hasNextPage) {
            return <MoreView isLoading={isFetchingNextPage} onClick={fetchNextPage} />;
        }

        return null;
    }, [
        status,
        hasNextPage,
        LoadingView,
        ErrorView,
        error,
        errorAction,
        MoreView,
        isFetchingNextPage,
        fetchNextPage,
    ]);

    return (
        <>
            {status === 'success' ? children : null}
            {content}
        </>
    );
};
