import {useMemo} from 'react';

import {useQueryClient} from '@tanstack/react-query';

import type {QueryDataSourceContext} from '../types';

export const useQueryContext = (): QueryDataSourceContext => {
    const queryClient = useQueryClient();
    const queryContext = useMemo(() => ({queryClient}), [queryClient]);

    return queryContext;
};
