import React from 'react';

import type {DataInfiniteWrapperProps} from '../DataInfiniteWrapper';
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
    MoreView: MoreViewProp,
    loadingViewProps,
    errorViewProps,
    moreViewProps,
    children,
}: DataInfiniteLoaderProps<TError>): React.ReactNode => {
    const MoreView = React.useCallback<DataInfiniteWrapperProps['MoreView']>(
        (moreProps) => <MoreViewProp {...moreProps} {...moreViewProps} />,
        [MoreViewProp, moreViewProps],
    );

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
                    MoreView={MoreView}
                >
                    {children}
                </DataInfiniteWrapper>
            ) : null}
            {renderView()}
        </>
    );
};
