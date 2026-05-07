import React from 'react';

import {QueryErrorResetBoundary} from '@tanstack/react-query';

import {AsyncBoundary} from '../../../react';

import type {QueryAsyncBoundaryProps} from './types';

export const QueryAsyncBoundary = <TError,>(
    props: QueryAsyncBoundaryProps<TError>,
): React.ReactNode => (
    <QueryErrorResetBoundary>
        {({reset}) => <AsyncBoundary onReset={reset} {...props} />}
    </QueryErrorResetBoundary>
);
