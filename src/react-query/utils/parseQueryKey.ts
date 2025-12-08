import type {QueryKey} from '@tanstack/react-query';

export const parseQueryKey = (queryKeyString: string): QueryKey => {
    return JSON.parse(queryKeyString) as QueryKey;
};
