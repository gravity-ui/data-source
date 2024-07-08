import type {DataLoaderStatus} from '../types/DataLoaderStatus';

export const mergeStatuses = (statuses: DataLoaderStatus[]): DataLoaderStatus => {
    if (statuses.some((status) => status === 'error')) {
        return 'error';
    }

    if (statuses.some((status) => status === 'loading')) {
        return 'loading';
    }

    return 'success';
};
