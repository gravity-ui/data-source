import {QueryClient} from '@tanstack/react-query';
import {renderHook} from '@testing-library/react';

import {useInfiniteQueryData} from '../../impl/infinite/hooks';
import type {AnyInfiniteQueryDataSource} from '../../impl/infinite/types';
import {usePlainQueryData} from '../../impl/plain/hooks';
import type {AnyPlainQueryDataSource} from '../../impl/plain/types';
import type {AnyQueryDataSource} from '../../types/base';
import {notReachable} from '../../utils/notReachable';
import {useQueryContext} from '../useQueryContext';
import {useQueryData} from '../useQueryData';

jest.mock('../useQueryContext');
jest.mock('../../impl/plain/hooks');
jest.mock('../../impl/infinite/hooks');
jest.mock('../../utils/notReachable');

describe('useQueryData', () => {
    const mockQueryClient = new QueryClient();
    const mockContext = {queryClient: mockQueryClient};
    const mockPlainState = {status: 'success', data: 'plain data'};
    const mockInfiniteState = {status: 'success', data: ['infinite data']};

    beforeEach(() => {
        jest.clearAllMocks();

        (useQueryContext as jest.Mock).mockReturnValue(mockContext);
        (usePlainQueryData as jest.Mock).mockReturnValue(mockPlainState);
        (useInfiniteQueryData as jest.Mock).mockReturnValue(mockInfiniteState);
        (notReachable as unknown as jest.Mock).mockReturnValue('not reachable');
    });

    it('should call usePlainQueryData for plain data source', () => {
        const dataSource: AnyPlainQueryDataSource = {
            type: 'plain',
            name: 'test',
            fetch: jest.fn(),
        };
        const params = {id: 1};
        const options = {refetchInterval: 1000};

        const {result} = renderHook(() => useQueryData(dataSource, params, options));

        expect(useQueryContext).toHaveBeenCalled();
        expect(usePlainQueryData).toHaveBeenCalledWith(mockContext, dataSource, params, options);
        expect(useInfiniteQueryData).not.toHaveBeenCalled();
        expect(result.current).toBe(mockPlainState);
    });

    it('should call useInfiniteQueryData for infinite data source', () => {
        const dataSource: AnyInfiniteQueryDataSource = {
            type: 'infinite',
            name: 'test',
            fetch: jest.fn(),
            next: jest.fn(),
        };
        const params = {id: 1};
        const options = {refetchInterval: 1000};

        const {result} = renderHook(() => useQueryData(dataSource, params, options));

        expect(useQueryContext).toHaveBeenCalled();
        expect(useInfiniteQueryData).toHaveBeenCalledWith(mockContext, dataSource, params, options);
        expect(usePlainQueryData).not.toHaveBeenCalled();
        expect(result.current).toBe(mockInfiniteState);
    });

    it('should call notReachable for unknown data source type', () => {
        const dataSource = {
            type: 'unknown',
            name: 'test',
            fetch: jest.fn(),
        } as unknown as AnyQueryDataSource;
        const params = {id: 1};

        (notReachable as unknown as jest.Mock).mockImplementation(() => {
            return 'not reachable';
        });

        renderHook(() => useQueryData(dataSource, params));

        expect(usePlainQueryData).not.toHaveBeenCalled();
        expect(useInfiniteQueryData).not.toHaveBeenCalled();
        expect(notReachable).toHaveBeenCalledWith('unknown', expect.any(String));
    });
});
