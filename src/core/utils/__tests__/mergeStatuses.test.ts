import type {DataLoaderStatus} from '../../types/DataLoaderStatus';
import {mergeStatuses} from '../mergeStatuses';

describe('mergeStatuses', () => {
    it('should return success when all statuses are success', () => {
        const statuses: DataLoaderStatus[] = ['success', 'success', 'success'];
        expect(mergeStatuses(statuses)).toBe('success');
    });

    it('should return loading when at least one status is loading', () => {
        const statuses: DataLoaderStatus[] = ['success', 'loading', 'success'];
        expect(mergeStatuses(statuses)).toBe('loading');
    });

    it('should return error when at least one status is error', () => {
        const statuses: DataLoaderStatus[] = ['success', 'error', 'success'];
        expect(mergeStatuses(statuses)).toBe('error');
    });

    it('should prioritize error over loading', () => {
        const statuses: DataLoaderStatus[] = ['loading', 'error', 'success'];
        expect(mergeStatuses(statuses)).toBe('error');
    });

    it('should handle empty array', () => {
        expect(mergeStatuses([])).toBe('success');
    });
});
