import React from 'react';

import {render, screen} from '@testing-library/react';

import type {DataManager} from '../../core';
import {useDataManager} from '../DataManagerContext';
import type {WithDataManagerProps} from '../withDataManager';
import {withDataManager} from '../withDataManager';

jest.mock('../DataManagerContext', () => {
    const originalModule = jest.requireActual('../DataManagerContext');
    return {
        ...originalModule,
        useDataManager: jest.fn(),
    };
});

describe('withDataManager', () => {
    const mockDataManager: DataManager = {
        invalidateTag: jest.fn(),
        invalidateTags: jest.fn(),
        invalidateSource: jest.fn(),
        resetSource: jest.fn(),
        invalidateParams: jest.fn(),
        resetParams: jest.fn(),
        invalidateSourceTags: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        (useDataManager as jest.Mock).mockReturnValue(mockDataManager);
    });

    it('should pass dataManager to wrapped component', () => {
        const TestComponent: React.FC<WithDataManagerProps> = ({dataManager}) => (
            <div data-testid="test-component">
                {dataManager ? 'DataManager provided' : 'No DataManager'}
            </div>
        );
        const WrappedComponent = withDataManager(TestComponent);

        render(<WrappedComponent />);

        expect(screen.getByTestId('test-component')).toHaveTextContent('DataManager provided');
    });

    it('should pass through additional props', () => {
        const TestComponent: React.FC<WithDataManagerProps & {testProp: string}> = ({
            dataManager,
            testProp,
        }) => (
            <div data-testid="test-component">
                {dataManager ? `DataManager provided, testProp: ${testProp}` : 'No DataManager'}
            </div>
        );
        const WrappedComponent = withDataManager(TestComponent);

        render(<WrappedComponent testProp="test value" />);

        expect(screen.getByTestId('test-component')).toHaveTextContent(
            'DataManager provided, testProp: test value',
        );
    });
});
