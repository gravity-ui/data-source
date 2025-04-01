import React from 'react';

import {render, screen} from '@testing-library/react';

import type {ErrorViewProps} from '../../types';
import {DataLoader} from '../DataLoader';
import type {DataLoaderProps} from '../types';

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

describe('DataLoader', () => {
    const renderDataLoader = (props: Partial<DataLoaderProps<Error>> = {}) => {
        const defaultProps: DataLoaderProps<Error> = {
            status: 'success',
            error: null,
            LoadingView: MockLoadingView,
            ErrorView: MockErrorView,
            children: <div data-testid="content">Content</div>,
        };

        return render(<DataLoader {...defaultProps} {...props} />);
    };

    it('should render children when status is success', () => {
        renderDataLoader({status: 'success'});
        expect(screen.getByTestId('content')).toBeInTheDocument();
        expect(screen.queryByTestId('loading-view')).not.toBeInTheDocument();
        expect(screen.queryByTestId('error-view')).not.toBeInTheDocument();
    });

    it('should render LoadingView when status is loading', () => {
        renderDataLoader({status: 'loading'});
        expect(screen.getByTestId('loading-view')).toBeInTheDocument();
        expect(screen.queryByTestId('content')).not.toBeInTheDocument();
        expect(screen.queryByTestId('error-view')).not.toBeInTheDocument();
    });

    it('should render ErrorView when status is error', () => {
        const error = new Error('Test error');
        renderDataLoader({status: 'error', error});
        expect(screen.getByTestId('error-view')).toBeInTheDocument();
        expect(screen.queryByTestId('content')).not.toBeInTheDocument();
        expect(screen.queryByTestId('loading-view')).not.toBeInTheDocument();
        expect(screen.getByText(/Test error/)).toBeInTheDocument();
    });

    it('should pass errorAction to ErrorView', () => {
        const error = new Error('Test error');
        const errorAction = jest.fn();
        renderDataLoader({
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
        renderDataLoader({
            status: 'error',
            error,
            errorAction,
        });
        expect(screen.getByText('Custom action')).toBeInTheDocument();
    });

    it('should pass loadingViewProps to LoadingView', () => {
        const LoadingView = jest.fn(MockLoadingView);
        const loadingViewProps = {customProp: 'test'};
        renderDataLoader({
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
        renderDataLoader({
            status: 'error',
            error,
            ErrorView,
            errorViewProps,
        });
        expect(ErrorView).toHaveBeenCalledWith(expect.objectContaining(errorViewProps), undefined);
    });
});
