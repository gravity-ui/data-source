import type {NormalizerConfig, createNormalizer} from '@normy/core';

export interface OptimisticUpdateConfig {
    /** Whether optimistic synchronization is enabled, defaults to false. Note: won't work without normalization */
    enabled?: boolean;
    /** Automatically calculate rollback data, defaults to true */
    autoCalculateRollback?: boolean;
    /** Whether debug logging is enabled */
    devLogging?: boolean;
}

export interface OptionsNormalizerConfig {
    /** Whether normalization is enabled, defaults to false */
    normalize?: boolean;
}

export type DataSourceNormalizerConfig = NormalizerConfig & OptionsNormalizerConfig;

/** Type for normalizer instance returned by createNormalizer */
export type Normalizer = ReturnType<typeof createNormalizer>;
