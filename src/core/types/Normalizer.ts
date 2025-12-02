import type {NormalizerConfig as NormalizeConfigBase} from '@normy/core';
import type {Data, NormalizedData} from '@normy/core/types/types';

import type {OptimisticConfig} from '../../react-query/types/normalizer';

export interface NormalizerConfig extends NormalizeConfigBase {
    initialData?: NormalizedData;
    optimistic?: boolean | OptimisticConfig;
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

export interface QueryNormalizer {
    /** Get normalized data */
    getNormalizedData: () => NormalizedData;
    /** Set normalized data (for manual updates, WebSocket, etc.) */
    setNormalizedData: (data: Data) => void;
    /** Clear all normalized data */
    clear: () => void;
    /** Get object by ID */
    getObjectById: <T extends Data>(id: string, exampleObject?: T) => T | undefined;
    /** Get query fragment */
    getQueryFragment: <T extends Data>(fragment: Data, exampleObject?: T) => T | undefined;
    /** Get dependent queries by data */
    getDependentQueries: (mutationData: Data) => ReadonlyArray<readonly unknown[]>;
    /** Get dependent queries by IDs */
    getDependentQueriesByIds: (ids: ReadonlyArray<string>) => ReadonlyArray<readonly unknown[]>;
    /** Subscribe to QueryCache changes */
    subscribe: () => void;
    /** Unsubscribe from QueryCache changes */
    unsubscribe: () => void;
}
