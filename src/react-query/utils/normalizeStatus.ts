import type {FetchStatus, QueryStatus} from '@tanstack/react-query';

import type {DataLoaderStatus} from '../../core';

export const normalizeStatus = (
    status: QueryStatus,
    fetchStatus: FetchStatus,
): DataLoaderStatus => {
    if (status === 'pending') {
        if (fetchStatus === 'fetching') {
            return 'loading';
        }

        return 'success';
    }

    return status;
};
