import React from 'react';

import type {AsyncProps} from './types';

export const Async: React.FC<AsyncProps> = ({LoadingView, children}) => {
    return <React.Suspense fallback={<LoadingView />}>{children}</React.Suspense>;
};
