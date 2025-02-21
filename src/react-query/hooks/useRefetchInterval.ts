import React from 'react';

import type {Query, QueryFunction, QueryFunctionContext, SkipToken} from '@tanstack/react-query';

import type {DataSourceError, DataSourceKey, DataSourceResponse} from '../../core';
import type {AnyQueryDataSource, RefetchInterval} from '../types';

export const useRefetchInterval = <TDataSource extends AnyQueryDataSource, TQueryData, TPageParams>(
    refetchIntervalOption?: RefetchInterval<
        DataSourceResponse<TDataSource>,
        DataSourceError<TDataSource>,
        TQueryData,
        DataSourceKey
    >,
    queryFnOption?:
        | QueryFunction<DataSourceResponse<TDataSource>, DataSourceKey, TPageParams>
        | SkipToken,
): {
    refetchInterval?:
        | number
        | false
        | ((
              query: Query<
                  DataSourceResponse<TDataSource>,
                  DataSourceError<TDataSource>,
                  TQueryData,
                  DataSourceKey
              >,
          ) => number | false | undefined);
    queryFn?:
        | QueryFunction<DataSourceResponse<TDataSource>, DataSourceKey, TPageParams>
        | SkipToken;
} => {
    const count = React.useRef<number>(0);

    const queryFn = React.useMemo(() => {
        if (typeof queryFnOption === 'function') {
            return (context: QueryFunctionContext<DataSourceKey, TPageParams>) => {
                count.current++;
                return queryFnOption(context);
            };
        }
        return undefined;
    }, [queryFnOption]);

    const refetchInterval = React.useMemo(() => {
        if (typeof refetchIntervalOption === 'function') {
            return (
                query: Query<
                    DataSourceResponse<TDataSource>,
                    DataSourceError<TDataSource>,
                    TQueryData,
                    DataSourceKey
                >,
            ) => {
                return refetchIntervalOption(query, count.current);
            };
        }
        return refetchIntervalOption;
    }, [refetchIntervalOption]);

    return {refetchInterval, queryFn};
};
