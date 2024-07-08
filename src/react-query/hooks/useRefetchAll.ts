import {useCallback} from 'react';

export const useRefetchAll = (states: {refetch: Function}[]) => {
    return useCallback(
        () => states.forEach(({refetch}) => refetch()),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        states.map(({refetch}) => refetch),
    );
};
