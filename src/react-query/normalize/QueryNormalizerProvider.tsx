import React from 'react';

import type {ClientDataManager} from '../ClientDataManager';
import type {DataSourceNormalizerConfig, OptimisticUpdateConfig} from '../types/normalizer';

import {createQueryNormalizer} from './normalization';

const QueryNormalizerContext = React.createContext<
    undefined | ReturnType<typeof createQueryNormalizer>
>(undefined);

export interface QueryNormalizerProviderProps {
    /** React Query client instance */
    dataManager: ClientDataManager;
    children: React.ReactNode;
    /** Configuration for the normalizer */
    normalizerConfig?: DataSourceNormalizerConfig;
    /** Configuration for optimistic updates */
    optimisticUpdateConfig?: OptimisticUpdateConfig;
}

export const QueryNormalizerProvider: React.FC<QueryNormalizerProviderProps> = ({
    dataManager,
    normalizerConfig = {},
    optimisticUpdateConfig = {},
    children,
}) => {
    const [queryNormalizer] = React.useState(() => {
        if (!dataManager.normalizer) {
            return null;
        }

        return createQueryNormalizer({
            queryClient: dataManager.queryClient,
            normalizer: dataManager.normalizer,
            optimisticUpdate: (data) => dataManager.optimisticUpdate(data),
            normalizerConfig,
            optimisticUpdateConfig,
        });
    });

    React.useEffect(() => {
        if (!queryNormalizer) {
            return undefined;
        }

        queryNormalizer.subscribe();

        return () => {
            queryNormalizer.unsubscribe();
            queryNormalizer.clear();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!queryNormalizer) {
        return <React.Fragment>{children}</React.Fragment>;
    }

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
