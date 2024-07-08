import type {DataLoaderStatus} from '../types/DataLoaderStatus';

import {mergeStatuses} from './mergeStatuses';

export const getStatus = (states: {status: DataLoaderStatus}[]) => {
    return mergeStatuses(states.map(({status}) => status));
};
