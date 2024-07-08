import React from 'react';

import type {DataManager} from '../core';

import {useDataManager} from './DataManagerContext';

export interface WithDataManagerProps {
    dataManager: DataManager;
}

export const withDataManager = <T extends WithDataManagerProps>(
    WrappedComponent: React.ComponentType<WithDataManagerProps>,
) => {
    const ComponentWithDataManager: React.FC<T> = (props) => {
        const dataManager = useDataManager();

        return <WrappedComponent {...props} dataManager={dataManager} />;
    };

    ComponentWithDataManager.displayName = `WithDataManager${
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
    }`;

    return ComponentWithDataManager;
};
