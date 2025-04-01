import React from 'react';

import type {DataManager} from '../core';

import {useDataManager} from './DataManagerContext';

export interface WithDataManagerProps {
    dataManager: DataManager;
}

export const withDataManager = <T,>(Component: React.ComponentType<T & WithDataManagerProps>) => {
    const ComponentWithDataManager: React.FC<T> = (props) => {
        const dataManager = useDataManager();

        return <Component {...props} dataManager={dataManager} />;
    };

    ComponentWithDataManager.displayName = `WithDataManager${
        Component.displayName || Component.name || 'Component'
    }`;

    return ComponentWithDataManager;
};
