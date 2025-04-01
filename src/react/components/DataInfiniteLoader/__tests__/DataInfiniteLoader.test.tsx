import React from 'react';

import {fireEvent, render, screen} from '@testing-library/react';

import type {ErrorViewProps} from '../../types';
import {DataInfiniteLoader} from '../DataInfiniteLoader';
import type {DataInfiniteLoaderProps, MoreViewProps} from '../types';

const MockLoadingView = () => <div data-testid="loading-view">Loading...</div>;
const MockErrorView: React.FC<ErrorViewProps<Error>> = ({error, action}) => (
    <div data-testid="error-view">
        {error ? `Error: ${error.message}` : 'No error'}
        {action ? (
            <button data-testid="error-action" onClick={action.handler}>
                {action.children || 'Retry'}
            </button>
        ) : null}
    </div>
);
const MockMoreView: React.FC<MoreViewProps> = ({isLoading, onClick}) => (
    <div data-testid="more-view">
        {isLoading ? (
            <span data-testid="more-view-loading">Loading more...</span>
        ) : (
            <button data-testid="more-view-button" onClick={onClick}>
                Load more
            </button>
        )}
    </div>
);

describe('DataInfiniteLoader', () => {
    const renderDataInfiniteLoader = (props: Partial<DataInfiniteLoaderProps<Error>> = {}) => {
        const fetchNextPage = jest.fn();
        const defaultProps: DataInfiniteLoaderProps<Error> = {
            status: 'success',
            error: null,
            hasNextPage: true,
            fetchNextPage,
            isFetchingNextPage: false,
            LoadingView: MockLoadingView,
            ErrorView: MockErrorView,
            MoreView: MockMoreView,
            children: <div data-testid="content">Content</div>,
        };

        return {
            ...render(<DataInfiniteLoader {...defaultProps} {...props} />),
            fetchNextPage,
        };
    };

    it('should render children and MoreView when status is success and hasNextPage is true', () => {
        renderDataInfiniteLoader({status: 'success', hasNextPage: true});
        expect(screen.getByTestId('content')).toBeInTheDocument();
        expect(screen.getByTestId('more-view')).toBeInTheDocument();
        expect(screen.queryByTestId('loading-view')).not.toBeInTheDocument();
        expect(screen.queryByTestId('error-view')).not.toBeInTheDocument();
    });

    it('should render only children when status is success and hasNextPage is false', () => {
        renderDataInfiniteLoader({status: 'success', hasNextPage: false});
        expect(screen.getByTestId('content')).toBeInTheDocument();
        expect(screen.queryByTestId('more-view')).not.toBeInTheDocument();
        expect(screen.queryByTestId('loading-view')).not.toBeInTheDocument();
        expect(screen.queryByTestId('error-view')).not.toBeInTheDocument();
    });

    it('should render LoadingView when status is loading', () => {
        renderDataInfiniteLoader({status: 'loading'});
        expect(screen.getByTestId('loading-view')).toBeInTheDocument();
        expect(screen.queryByTestId('content')).not.toBeInTheDocument();
        expect(screen.queryByTestId('more-view')).not.toBeInTheDocument();
        expect(screen.queryByTestId('error-view')).not.toBeInTheDocument();
    });

    it('should render ErrorView when status is error', () => {
        const error = new Error('Test error');
        renderDataInfiniteLoader({status: 'error', error});
        expect(screen.getByTestId('error-view')).toBeInTheDocument();
        expect(screen.queryByTestId('content')).not.toBeInTheDocument();
        expect(screen.queryByTestId('more-view')).not.toBeInTheDocument();
        expect(screen.queryByTestId('loading-view')).not.toBeInTheDocument();
        expect(screen.getByText(/Test error/)).toBeInTheDocument();
    });

    it('should call fetchNextPage when clicking on load more button', () => {
        const {fetchNextPage} = renderDataInfiniteLoader({
            status: 'success',
            hasNextPage: true,
            isFetchingNextPage: false,
        });
        fireEvent.click(screen.getByTestId('more-view-button'));
        expect(fetchNextPage).toHaveBeenCalledTimes(1);
    });

    it('should show loading state in MoreView when isFetchingNextPage is true', () => {
        renderDataInfiniteLoader({
            status: 'success',
            hasNextPage: true,
            isFetchingNextPage: true,
        });
        expect(screen.getByTestId('more-view-loading')).toBeInTheDocument();
        expect(screen.queryByTestId('more-view-button')).not.toBeInTheDocument();
    });

    it('should pass errorAction to ErrorView', () => {
        const error = new Error('Test error');
        const errorAction = jest.fn();
        renderDataInfiniteLoader({
            status: 'error',
            error,
            errorAction,
        });
        expect(screen.getByTestId('error-action')).toBeInTheDocument();
    });

    it('should pass errorAction with custom children to ErrorView', () => {
        const error = new Error('Test error');
        const errorAction = {
            handler: jest.fn(),
            children: 'Custom action',
        };
        renderDataInfiniteLoader({
            status: 'error',
            error,
            errorAction,
        });
        expect(screen.getByText('Custom action')).toBeInTheDocument();
    });

    it('should pass loadingViewProps to LoadingView', () => {
        const LoadingView = jest.fn(MockLoadingView);
        const loadingViewProps = {customProp: 'test'};
        renderDataInfiniteLoader({
            status: 'loading',
            LoadingView,
            loadingViewProps,
        });
        expect(LoadingView).toHaveBeenCalledWith(
            expect.objectContaining(loadingViewProps),
            undefined,
        );
    });

    it('should pass errorViewProps to ErrorView', () => {
        const ErrorView = jest.fn(MockErrorView);
        const errorViewProps = {customProp: 'test'};
        const error = new Error('Test error');
        renderDataInfiniteLoader({
            status: 'error',
            error,
            ErrorView,
            errorViewProps,
        });
        expect(ErrorView).toHaveBeenCalledWith(expect.objectContaining(errorViewProps), undefined);
    });

    it('should pass moreViewProps to MoreView', () => {
        const MoreView = jest.fn(MockMoreView);
        const moreViewProps = {customProp: 'test'};
        renderDataInfiniteLoader({
            status: 'success',
            hasNextPage: true,
            MoreView,
            moreViewProps,
        });
        expect(MoreView).toHaveBeenCalledWith(expect.objectContaining(moreViewProps), undefined);
    });
});
