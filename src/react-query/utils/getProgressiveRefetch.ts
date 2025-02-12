import type {
    FunctionRefetchInterval,
    ProgressiveRefetchInterval,
} from '../../core/types/RefetchInterval';

export const getProgressiveRefetch = ({
    minInterval,
    maxInterval,
    count,
}: ProgressiveRefetchInterval): FunctionRefetchInterval => {
    const refetchCount = count ?? getRefetchCountToMaxInterval({minInterval, maxInterval});

    return (_, queryRefetchCount) => {
        if (queryRefetchCount > refetchCount) {
            return maxInterval;
        }

        const grade = Math.min(queryRefetchCount, refetchCount);
        return Math.min(minInterval * 2 ** grade, maxInterval);
    };
};

function getRefetchCountToMaxInterval({
    minInterval,
    maxInterval,
}: ProgressiveRefetchInterval): number {
    return Math.ceil(Math.log2(maxInterval / minInterval));
}
