import React from 'react';

import type {DataInfiniteWrapperProps, MoreViewProps} from './types';

export const DataInfiniteWrapper = <TMoreViewProps extends MoreViewProps = MoreViewProps>({
    reverse,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    fetchPreviousPage,
    MoreView,
    moreViewProps,
    children,
}: DataInfiniteWrapperProps<TMoreViewProps>) => {
    const previousNode =
        hasPreviousPage && typeof isFetchingPreviousPage === 'boolean' && fetchPreviousPage ? (
            <MoreView
                type="previous"
                isLoading={isFetchingPreviousPage}
                onClick={fetchPreviousPage}
                {...moreViewProps}
            />
        ) : null;
    const nextNode = hasNextPage ? (
        <MoreView
            type="next"
            isLoading={isFetchingNextPage}
            onClick={fetchNextPage}
            {...moreViewProps}
        />
    ) : null;

    return (
        <>
            {reverse ? nextNode : previousNode}
            {children}
            {reverse ? previousNode : nextNode}
        </>
    );
};
