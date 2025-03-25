import {createContext, useContext} from 'react';

import type {DataManager} from '../core';

export const DataManagerContext = createContext<DataManager | null>(null);

export const useDataManager = () => {
    const dataManager = useContext(DataManagerContext);

    if (!dataManager) {
        throw new Error(
            'DataManager is not provided by context. Use DataManagerContext.Provider to do it',
        );
    }

    return dataManager;
};
