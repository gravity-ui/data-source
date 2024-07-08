import type {FetchStatus, QueryStatus} from '@tanstack/react-query';

import type {DataLoaderStatus} from '../../core';

export const normalizeStatus = (
    status: QueryStatus,
    fetchStatus: FetchStatus,
): DataLoaderStatus => {
    if (status === 'loading' && fetchStatus === 'idle') {
        return 'success';
    }

    return status;
};
