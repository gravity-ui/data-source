import type {DependencyList} from 'react';
import {useCallback} from 'react';

export const useRefetchErrored = <TError>(states: {error: TError | null; refetch: Function}[]) => {
    return useCallback(
        () => states.forEach(({error, refetch}) => error && refetch()),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        states.reduce<DependencyList>((acc, {error, refetch}) => [...acc, error, refetch], []),
    );
};
