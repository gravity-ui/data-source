import {renderHook} from '@testing-library/react';

import {getError, getStatus} from '../../../core';
import type {DataLoaderStatus} from '../../../core/types/DataLoaderStatus';
import {useQueryResponses} from '../useQueryResponses';
import {useRefetchAll} from '../useRefetchAll';
import {useRefetchErrored} from '../useRefetchErrored';

jest.mock('../useRefetchAll');
jest.mock('../useRefetchErrored');
jest.mock('../../../core', () => {
    const originalModule = jest.requireActual('../../../core');
    return {
        ...originalModule,
        getStatus: jest.fn(),
        getError: jest.fn(),
    };
});

describe('useQueryResponses', () => {
    const mockRefetchAll = jest.fn();
    const mockRefetchErrored = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useRefetchAll as jest.Mock).mockReturnValue(mockRefetchAll);
        (useRefetchErrored as jest.Mock).mockReturnValue(mockRefetchErrored);
        (getStatus as jest.Mock).mockReturnValue('success');
        (getError as jest.Mock).mockReturnValue(null);
    });

    it('should return combined status, error, and refetch functions', () => {
        const responses = [
            {status: 'loading' as DataLoaderStatus, error: null, refetch: jest.fn()},
            {status: 'success' as DataLoaderStatus, error: null, refetch: jest.fn()},
            {status: 'error' as DataLoaderStatus, error: {message: 'Error'}, refetch: jest.fn()},
        ];

        const {result} = renderHook(() => useQueryResponses(responses));

        expect(getStatus).toHaveBeenCalledWith(responses);
        expect(getError).toHaveBeenCalledWith(responses);
        expect(useRefetchAll).toHaveBeenCalledWith(responses);
        expect(useRefetchErrored).toHaveBeenCalledWith(responses);
        expect(result.current).toEqual({
            status: 'success',
            error: null,
            refetch: mockRefetchAll,
            refetchErrored: mockRefetchErrored,
        });
    });

    it('should handle empty responses array', () => {
        const {result} = renderHook(() => useQueryResponses([]));

        expect(getStatus).toHaveBeenCalledWith([]);
        expect(getError).toHaveBeenCalledWith([]);
        expect(useRefetchAll).toHaveBeenCalledWith([]);
        expect(useRefetchErrored).toHaveBeenCalledWith([]);
        expect(result.current).toEqual({
            status: 'success',
            error: null,
            refetch: mockRefetchAll,
            refetchErrored: mockRefetchErrored,
        });
    });
});
