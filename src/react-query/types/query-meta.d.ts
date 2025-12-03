import '@tanstack/react-query';

import type {OptimisticConfig} from '../../core/types/Normalizer';

declare module '@tanstack/react-query' {
    interface Register {
        queryMeta: {
            optimistic?: boolean | OptimisticConfig;
            invalidate?: boolean;
        };
    }
}
