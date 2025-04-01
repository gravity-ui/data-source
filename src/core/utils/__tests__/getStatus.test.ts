import type {DataLoaderStatus} from '../../types/DataLoaderStatus';
import {getStatus} from '../getStatus';

describe('getStatus', () => {
    it('should return success when all statuses are success', () => {
        const states = [
            {status: 'success' as DataLoaderStatus},
            {status: 'success' as DataLoaderStatus},
            {status: 'success' as DataLoaderStatus},
        ];
        expect(getStatus(states)).toBe('success');
    });

    it('should return loading when at least one status is loading', () => {
        const states = [
            {status: 'success' as DataLoaderStatus},
            {status: 'loading' as DataLoaderStatus},
            {status: 'success' as DataLoaderStatus},
        ];
        expect(getStatus(states)).toBe('loading');
    });

    it('should return error when at least one status is error', () => {
        const states = [
            {status: 'success' as DataLoaderStatus},
            {status: 'error' as DataLoaderStatus},
            {status: 'success' as DataLoaderStatus},
        ];
        expect(getStatus(states)).toBe('error');
    });

    it('should prioritize error over loading', () => {
        const states = [
            {status: 'loading' as DataLoaderStatus},
            {status: 'error' as DataLoaderStatus},
            {status: 'success' as DataLoaderStatus},
        ];
        expect(getStatus(states)).toBe('error');
    });

    it('should handle empty array', () => {
        expect(getStatus([])).toBe('success');
    });
});
