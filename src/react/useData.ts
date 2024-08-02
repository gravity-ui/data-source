import {useEffect, useState} from 'react';

import type {
    AnyDataSource,
    DataObserver,
    DataSourceContext,
    DataSourceOptions,
    DataSourceParams,
    DataSourceState,
} from '../core';
import {composeKey} from '../core';

export const useData = <TDataSource extends AnyDataSource>(
    dataSource: TDataSource,
    context: DataSourceContext<TDataSource>,
    params: DataSourceParams<TDataSource>,
    options?: DataSourceOptions<TDataSource>,
): [DataSourceState<TDataSource>, DataObserver<TDataSource>] => {
    const [observer] = useState(() => dataSource.observe(context, params, options));
    const [state, setState] = useState<DataSourceState<TDataSource>>(() =>
        observer.getCurrentState(),
    );

    useEffect(() => {
        return observer.subscribe(setState);
    }, [observer]);

    const key = composeKey(dataSource, params);

    useEffect(() => {
        observer.updateParams(params, options);
        // Key replaces params and other deps are static
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options, key]);

    return [state, observer];
};
