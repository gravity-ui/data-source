import React from 'react';

import {QueryClientProvider} from '@tanstack/react-query';

import {DataManagerProvider} from '../react/DataManagerProvider';

import type {ClientDataManager} from './ClientDataManager';

export interface DataSourceProviderProps {
    dataManager: ClientDataManager;
    children: React.ReactNode;
}

export const DataSourceProvider: React.FC<DataSourceProviderProps> = ({children, dataManager}) => {
    React.useEffect(() => {
        if (!dataManager.queryNormalizer) {
            return undefined;
        }

        dataManager.queryNormalizer.subscribe();

        return () => {
            dataManager.queryNormalizer?.unsubscribe();
            dataManager.queryNormalizer?.clear();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <QueryClientProvider client={dataManager.queryClient}>
            <DataManagerProvider dataManager={dataManager}>{children}</DataManagerProvider>
        </QueryClientProvider>
    );
};
