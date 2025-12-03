import type {NormalizerConfig as NormalizeConfigBase} from '@normy/core';
import type {Data, NormalizedData} from '@normy/core/types/types';

import type {OptimisticConfig} from '../../react-query/types/normalizer';

export interface NormalizerConfig extends NormalizeConfigBase {
    initialData?: NormalizedData;
    optimistic?: boolean | OptimisticConfig;
    invalidate?: boolean;
}

export interface Normalizer {
    getNormalizedData: () => NormalizedData;
    clearNormalizedData: () => void;
    setQuery: (queryKey: string, queryData: Data) => void;
    removeQuery: (queryKey: string) => void;
    getQueriesToUpdate: (mutationData: Data) => {
        queryKey: string;
        data: Data;
    }[];
    getObjectById: <T extends Data>(id: string, exampleObject?: T) => T | undefined;
    getQueryFragment: <T extends Data>(fragment: Data, exampleObject?: T) => T | undefined;
    getDependentQueries: (mutationData: Data) => readonly string[];
    getDependentQueriesByIds: (ids: ReadonlyArray<string>) => readonly string[];
    getCurrentData: <T extends Data>(newData: T) => T | undefined;
    log: (...messages: unknown[]) => void;
}
