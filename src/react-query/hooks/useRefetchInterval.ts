import React from 'react';

import type {Query} from '@tanstack/react-query';

import type {RefetchInterval} from '../types';

export const useRefetchInterval = (refetchIntervalOption?: RefetchInterval) => {
    const count = React.useRef<number | undefined>(undefined);

    const functionRefetchInterval = React.useCallback(
        (query: Query) => {
            if (count.current === undefined) {
                count.current = query.state.dataUpdateCount;
            }
            return typeof refetchIntervalOption === 'function'
                ? refetchIntervalOption(query, query.state.dataUpdateCount - count.current)
                : undefined;
        },
        [refetchIntervalOption],
    );

    if (typeof refetchIntervalOption === 'function') {
        return functionRefetchInterval;
    }

    return refetchIntervalOption;
};
