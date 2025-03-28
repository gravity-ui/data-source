import type {AnyDataSource} from '../../types/DataSource';
import type {Cancellable} from '../withCancellation';
import {isAbortable, isCancellable, withCancellation} from '../withCancellation';

describe('withCancellation', () => {
    describe('isCancellable', () => {
        it('should return true for objects with cancel method', () => {
            const cancellable: Cancellable = {
                cancel: jest.fn(),
            };
            expect(isCancellable(cancellable)).toBe(true);
        });

        it('should return false for null', () => {
            expect(isCancellable(null)).toBe(false);
        });

        it('should return false for objects without cancel method', () => {
            expect(isCancellable({})).toBe(false);
        });

        it('should return false for objects with invalid cancel method', () => {
            expect(isCancellable({cancel: 'not a function'})).toBe(false);
        });
    });

    describe('isAbortable', () => {
        it('should return true for objects with valid signal', () => {
            const abortController = new AbortController();
            const abortable = {signal: abortController.signal};
            expect(isAbortable(abortable)).toBe(true);
        });

        it('should return false for null', () => {
            expect(isAbortable(null)).toBe(false);
        });

        it('should return false for objects without signal', () => {
            expect(isAbortable({})).toBe(false);
        });

        it('should return false for objects with invalid signal', () => {
            expect(isAbortable({signal: {}})).toBe(false);
        });
    });

    describe('withCancellation', () => {
        it('should add abort listener when fetch returns cancellable and context is abortable', () => {
            const mockCancel = jest.fn();
            const cancellable: Cancellable = {
                cancel: mockCancel,
            };

            const abortController = new AbortController();
            const fetchContext = {signal: abortController.signal};

            const mockFetch = jest.fn().mockReturnValue(cancellable);
            const dataSource: AnyDataSource = {
                name: 'test',
                fetch: mockFetch,
            };

            const wrappedFetch = withCancellation(dataSource.fetch);
            const result = wrappedFetch({}, fetchContext, {});

            expect(mockFetch).toHaveBeenCalledWith({}, fetchContext, {});
            expect(result).toBe(cancellable);
            expect(mockCancel).not.toHaveBeenCalled();

            // Simulate abort
            abortController.abort();
            expect(mockCancel).toHaveBeenCalled();
        });

        it('should not add abort listener when fetch returns non-cancellable', () => {
            const abortController = new AbortController();
            const fetchContext = {signal: abortController.signal};

            const mockFetch = jest.fn().mockReturnValue('not cancellable');
            const dataSource: AnyDataSource = {
                name: 'test',
                fetch: mockFetch,
            };

            const wrappedFetch = withCancellation(dataSource.fetch);
            const result = wrappedFetch({}, fetchContext, {});

            expect(mockFetch).toHaveBeenCalledWith({}, fetchContext, {});
            expect(result).toBe('not cancellable');

            // No error should occur when aborting
            abortController.abort();
        });

        it('should not add abort listener when context is not abortable', () => {
            const mockCancel = jest.fn();
            const cancellable: Cancellable = {
                cancel: mockCancel,
            };

            const fetchContext = {};

            const mockFetch = jest.fn().mockReturnValue(cancellable);
            const dataSource: AnyDataSource = {
                name: 'test',
                fetch: mockFetch,
            };

            const wrappedFetch = withCancellation(dataSource.fetch);
            const result = wrappedFetch({}, fetchContext, {});

            expect(mockFetch).toHaveBeenCalledWith({}, fetchContext, {});
            expect(result).toBe(cancellable);
            expect(mockCancel).not.toHaveBeenCalled();
        });
    });
});
