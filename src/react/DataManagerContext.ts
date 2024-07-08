import {createContext, useContext} from 'react';

import type {DataManager} from '../core';

export const DataManagerContext = createContext<DataManager | null>(null);

export const useDataManager = () => {
    const dataManager = useContext(DataManagerContext);

    if (!dataManager) {
        throw new Error(
            'DataManager is not provied by context. Use DataManagerContext.Provider to do it',
        );
    }

    return dataManager;
};
