import type {DataLoaderStatus} from '../../core';
import {getError, getStatus} from '../../core';

import {useRefetchAll} from './useRefetchAll';
import {useRefetchErrored} from './useRefetchErrored';

export const useQueryResponses = <TError>(
    responses: {
        status: DataLoaderStatus;
        error: TError | null;
        refetch: Function;
    }[],
) => {
    return {
        status: getStatus(responses),
        error: getError(responses),
        refetch: useRefetchAll(responses),
        refetchErrored: useRefetchErrored(responses),
    };
};
