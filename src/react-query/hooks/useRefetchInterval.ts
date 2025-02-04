import React from 'react';

import type {BaseRefetchInterval, ProgressiveRefetchInterval, RefetchInterval} from '../types';

export const useRefetchInterval = (
    refetchIntervalOption?: RefetchInterval,
): BaseRefetchInterval => {
    const {minInterval = 0, maxInterval = 0} = refetchIntervalOption as ProgressiveRefetchInterval;
    const [refetchInterval, setRefetchInterval] = React.useState(minInterval);
    const [lastTick, setLastTick] = React.useState(Date.now());

    const next = React.useCallback(() => {
        if (refetchInterval < maxInterval && Date.now() - lastTick > refetchInterval) {
            setRefetchInterval(Math.min(refetchInterval * 2, maxInterval));
            setLastTick(Date.now());
        }
        return refetchInterval;
    }, [refetchInterval, maxInterval, lastTick]);

    if (!isProgressiveRefetchInterval(refetchIntervalOption)) {
        return refetchIntervalOption as BaseRefetchInterval;
    }

    return next;
};

function isProgressiveRefetchInterval(refetchInterval?: RefetchInterval) {
    return typeof refetchInterval === 'object';
}
