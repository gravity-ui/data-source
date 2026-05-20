import type {ComponentType, ReactNode} from 'react';

export type MoreViewType = 'next' | 'prev';

export interface MoreViewProps {
    type: MoreViewType;
    isLoading: boolean;
    onClick: () => void;
}

export interface DataInfiniteWrapperProps {
    reverse?: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => unknown;
    hasPreviousPage?: boolean;
    isFetchingPreviousPage?: boolean;
    fetchPreviousPage?: () => unknown;
    MoreView: ComponentType<MoreViewProps>;
    children: ReactNode;
}
