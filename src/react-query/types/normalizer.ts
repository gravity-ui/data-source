import type {Data, NormalizedData} from '@normy/core/types/types';

export interface OptimisticConfig {
    /** Automatically calculate rollback data, defaults to true */
    autoCalculateRollback?: boolean;
    /** Whether debug logging is enabled */
    devLogging?: boolean;
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
