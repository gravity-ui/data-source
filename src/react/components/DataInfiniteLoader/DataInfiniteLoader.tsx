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
    loadingViewProps,
    errorViewProps,
    moreViewProps,
    children,
}: DataInfiniteLoaderProps<TError>): React.ReactNode => {
    const errorAction = React.useMemo<ErrorViewProps<TError>['action']>(
        () =>
            typeof errorActionProp === 'function' ? {handler: errorActionProp} : errorActionProp,
        [errorActionProp],
    );

    const renderContent = () => {
        if (status === 'loading') {
            return <LoadingView {...loadingViewProps} />;
        }

        if (status === 'error') {
            return <ErrorView error={error} action={errorAction} {...errorViewProps} />;
        }

        if (status === 'success' && hasNextPage) {
            return (
                <MoreView
                    isLoading={isFetchingNextPage}
                    onClick={fetchNextPage}
                    {...moreViewProps}
                />
            );
        }

        return null;
    };

    return (
        <>
            {status === 'success' ? children : null}
            {renderContent()}
        </>
    );
};
