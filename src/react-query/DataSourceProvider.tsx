import React from 'react';

import {QueryClientProvider} from '@tanstack/react-query';

import {DataManagerContext} from '../react/DataManagerContext';

import type {ClientDataManager} from './ClientDataManager';
import type {QueryNormalizerProviderProps} from './normalize/QueryNormalizerProvider';
import {QueryNormalizerProvider} from './normalize/QueryNormalizerProvider';

export interface DataSourceProviderProps extends Omit<QueryNormalizerProviderProps, 'queryClient'> {
    /** Pass ClientDataManager to use its queryClient in QueryNormalizerProvider */
    dataManager: ClientDataManager;
}

export const DataSourceProvider: React.FC<DataSourceProviderProps> = ({
    children,
    dataManager,
    ...restProps
}) => {
    return (
        <QueryNormalizerProvider queryClient={dataManager.queryClient} {...restProps}>
            <QueryClientProvider client={dataManager.queryClient}>
                <DataManagerContext.Provider value={dataManager}>
                    {children}
                </DataManagerContext.Provider>
            </QueryClientProvider>
        </QueryNormalizerProvider>
    );
};
