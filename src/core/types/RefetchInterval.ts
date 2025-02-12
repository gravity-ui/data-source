import type {Query} from '@tanstack/react-query';

export type FunctionRefetchInterval = (query: Query, count: number) => number | false | undefined;

export type RefetchInterval = number | false | FunctionRefetchInterval;

export type ProgressiveRefetchInterval = {
    minInterval: number;
    maxInterval: number;
    count?: number;
};
