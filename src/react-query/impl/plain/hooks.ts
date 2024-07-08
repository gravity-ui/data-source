import {useMemo} from 'react';

import {useQuery} from '@tanstack/react-query';

import type {DataSourceContext, DataSourceOptions, DataSourceParams} from '../../../core';

import type {AnyPlainQueryDataSource} from './types';
import {composeOptions, transformResult} from './utils';

export const usePlainQueryData = <TDataSource extends AnyPlainQueryDataSource>(
    context: DataSourceContext<TDataSource>,
    dataSource: TDataSource,
    params: DataSourceParams<TDataSource>,
    options?: DataSourceOptions<TDataSource>,
) => {
    const composedOptions = composeOptions(context, dataSource, params, options);
    const result = useQuery(composedOptions);

    return useMemo(() => transformResult(result), [result]);
};
