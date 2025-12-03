import React from 'react';

import {renderHook} from '@testing-library/react';

import type {DataManager} from '../../core';
import {DataManagerContext, useDataManager} from '../DataManagerContext';

describe('useDataManager', () => {
    it('should return dataManager from context', () => {
        const mockDataManager: DataManager = {
            normalizer: undefined,
            optimisticUpdate: jest.fn(),
            invalidateData: jest.fn(),
            invalidateTag: jest.fn(),
            invalidateTags: jest.fn(),
            invalidateSource: jest.fn(),
            resetSource: jest.fn(),
            invalidateParams: jest.fn(),
            resetParams: jest.fn(),
            invalidateSourceTags: jest.fn(),
        };

        const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => (
            <DataManagerContext.Provider value={mockDataManager}>
                {children}
            </DataManagerContext.Provider>
        );

        const {result} = renderHook(() => useDataManager(), {wrapper});

        expect(result.current).toBe(mockDataManager);
    });

    it('should throw an error when dataManager is not provided', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        expect(() => {
            renderHook(() => useDataManager());
        }).toThrow(
            'DataManager is not provided by context. Use DataManagerContext.Provider to do it',
        );

        consoleSpy.mockRestore();
    });
});
