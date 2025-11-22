import React from 'react';

import type {DataManager} from '../core';

import {DataManagerContext} from './DataManagerContext';

export interface DataManagerProviderProps {
    children: React.ReactNode;
    dataManager: DataManager;
}

export const DataManagerProvider: React.FC<DataManagerProviderProps> = ({
    children,
    dataManager,
}) => {
    return (
        <DataManagerContext.Provider value={dataManager}>{children}</DataManagerContext.Provider>
    );
};
