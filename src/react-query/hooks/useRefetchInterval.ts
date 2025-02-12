import React from 'react';

import type {Query} from '@tanstack/react-query';

import type {RefetchInterval} from '../../core/types/RefetchInterval';

export const useRefetchInterval = (refetchIntervalOption?: RefetchInterval) => {
    const count = React.useRef<number | undefined>(undefined);

    if (typeof refetchIntervalOption === 'function') {
        return (query: Query) => {
            if (count.current === undefined) {
                count.current = query.state.dataUpdateCount;
            }
            return refetchIntervalOption(query, query.state.dataUpdateCount - count.current);
        };
    }

    return refetchIntervalOption;
};
