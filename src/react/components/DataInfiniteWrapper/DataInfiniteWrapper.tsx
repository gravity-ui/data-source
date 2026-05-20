import React from 'react';

import type {DataInfiniteWrapperProps} from './types';

export const DataInfiniteWrapper: React.FC<DataInfiniteWrapperProps> = ({
    reverse,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    fetchPreviousPage,
    MoreView,
    children,
}) => {
    const previousNode =
        hasPreviousPage && typeof isFetchingPreviousPage === 'boolean' && fetchPreviousPage ? (
            <MoreView type="prev" isLoading={isFetchingPreviousPage} onClick={fetchPreviousPage} />
        ) : null;
    const nextNode = hasNextPage ? (
        <MoreView type="next" isLoading={isFetchingNextPage} onClick={fetchNextPage} />
    ) : null;

    return (
        <>
            {reverse ? nextNode : previousNode}
            {children}
            {reverse ? previousNode : nextNode}
        </>
    );
};
