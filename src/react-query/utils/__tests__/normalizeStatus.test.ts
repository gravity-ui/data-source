import type {FetchStatus, QueryStatus} from '@tanstack/react-query';

import {normalizeStatus} from '../normalizeStatus';

describe('normalizeStatus', () => {
    it('should return loading when status is pending and fetchStatus is fetching', () => {
        const status: QueryStatus = 'pending';
        const fetchStatus: FetchStatus = 'fetching';

        const result = normalizeStatus(status, fetchStatus);

        expect(result).toBe('loading');
    });

    it('should return success when status is pending and fetchStatus is not fetching', () => {
        const status: QueryStatus = 'pending';
        const fetchStatus: FetchStatus = 'idle';

        const result = normalizeStatus(status, fetchStatus);

        expect(result).toBe('success');
    });

    it('should return success when status is success', () => {
        const status: QueryStatus = 'success';
        const fetchStatus: FetchStatus = 'idle';

        const result = normalizeStatus(status, fetchStatus);

        expect(result).toBe('success');
    });

    it('should return error when status is error', () => {
        const status: QueryStatus = 'error';
        const fetchStatus: FetchStatus = 'idle';

        const result = normalizeStatus(status, fetchStatus);

        expect(result).toBe('error');
    });
});
