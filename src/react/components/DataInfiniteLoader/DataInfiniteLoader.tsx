import React from 'react';

import {DataInfiniteWrapper} from '../DataInfiniteWrapper';
import type {ErrorViewProps} from '../types';

import type {DataInfiniteLoaderProps} from './types';

export const DataInfiniteLoader = <TError,>({
    status,
    error,
    errorAction: errorActionProp,
    reverse,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    fetchPreviousPage,
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

    const renderView = () => {
        if (status === 'loading') {
            return <LoadingView {...loadingViewProps} />;
        }

        if (status === 'error') {
            return <ErrorView error={error} action={errorAction} {...errorViewProps} />;
        }

        return null;
    };

    return (
        <>
            {status === 'success' ? (
                <DataInfiniteWrapper
                    reverse={reverse}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    fetchNextPage={fetchNextPage}
                    hasPreviousPage={hasPreviousPage}
                    isFetchingPreviousPage={isFetchingPreviousPage}
                    fetchPreviousPage={fetchPreviousPage}
                    MoreView={(moreProps) => <MoreView {...moreProps} {...moreViewProps} />}
                >
                    {children}
                </DataInfiniteWrapper>
            ) : null}
            {renderView()}
        </>
    );
};
