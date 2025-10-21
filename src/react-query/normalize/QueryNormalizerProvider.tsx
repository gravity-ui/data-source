import React from 'react';

import {createNormalizer} from '@normy/core';
import type {NormalizedData} from '@normy/core/types/types';
import type {QueryClient} from '@tanstack/react-query';

import type {
    DataSourceNormalizerConfig,
    Normalizer,
    OptimisticUpdateConfig,
} from '../types/normalizer';

import {createQueryNormalizer} from './normalization';

const QueryNormalizerContext = React.createContext<
    undefined | ReturnType<typeof createQueryNormalizer>
>(undefined);

export interface QueryNormalizerProviderProps {
    /** React Query client instance */
    queryClient: QueryClient;
    children: React.ReactNode;
    /** Configuration for the normalizer */
    normalizerConfig?: DataSourceNormalizerConfig;
    /** Initial normalized data to populate the store */
    initialNormalizedData?: NormalizedData;
    /** Configuration for optimistic updates */
    optimisticUpdateConfig?: OptimisticUpdateConfig;
    /** Custom normalizer instance */
    normalizer?: Normalizer;
}

export const QueryNormalizerProvider: React.FC<QueryNormalizerProviderProps> = ({
    queryClient,
    normalizerConfig = {},
    initialNormalizedData,
    optimisticUpdateConfig = {},
    normalizer: customNormalizer,
    children,
}) => {
    const [queryNormalizer] = React.useState(() => {
        const normalizer =
            customNormalizer ?? createNormalizer(normalizerConfig, initialNormalizedData);

        return createQueryNormalizer({
            queryClient,
            normalizer,
            normalizerConfig,
            optimisticUpdateConfig,
        });
    });

    React.useEffect(() => {
        queryNormalizer.subscribe();

        return () => {
            queryNormalizer.unsubscribe();
            queryNormalizer.clear();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <QueryNormalizerContext.Provider value={queryNormalizer}>
            {children}
        </QueryNormalizerContext.Provider>
    );
};

export const useQueryNormalizer = () => {
    const queryNormalizer = React.useContext(QueryNormalizerContext);

    if (!queryNormalizer) {
        throw new Error('No QueryNormalizer set, use QueryNormalizerProvider to set one');
    }

    return queryNormalizer;
};
