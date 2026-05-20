import type {ComponentType, ReactNode} from 'react';

export type MoreViewType = 'next' | 'prev';

export interface MoreViewProps {
    type: MoreViewType;
    isLoading: boolean;
    onClick: () => void;
}

export interface DataInfiniteWrapperProps<TMoreViewProps extends MoreViewProps = MoreViewProps> {
    reverse?: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => unknown;
    hasPreviousPage?: boolean;
    isFetchingPreviousPage?: boolean;
    fetchPreviousPage?: () => unknown;
    MoreView: ComponentType<MoreViewProps>;
    moreViewProps?: Omit<TMoreViewProps, keyof MoreViewProps>;
    children: ReactNode;
}
