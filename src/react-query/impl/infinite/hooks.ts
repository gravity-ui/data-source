import {useMemo} from 'react';

import {useInfiniteQuery} from '@tanstack/react-query';

import type {DataSourceContext, DataSourceOptions, DataSourceParams} from '../../../core';

import type {AnyInfiniteQueryDataSource} from './types';
import {composeOptions, transformResult} from './utils';

export const useInfiniteQueryData = <TDataSource extends AnyInfiniteQueryDataSource>(
    context: DataSourceContext<TDataSource>,
    dataSource: TDataSource,
    params: DataSourceParams<TDataSource>,
    options?: DataSourceOptions<TDataSource>,
) => {
    const composedOptions = composeOptions(context, dataSource, params, options);
    const result = useInfiniteQuery(composedOptions);

    return useMemo(() => transformResult(result), [result]);
};
