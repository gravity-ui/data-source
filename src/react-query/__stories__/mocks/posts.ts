import type {MockUser} from './users';
import {MOCK_USERS} from './users';

export type MockPostStatus = 'published' | 'draft';

export interface MockPost {
    id: number;
    title: string;
    description: string;
    status: MockPostStatus;
    createdAt: string;
    author: MockUser;
}

export const MOCK_POSTS: MockPost[] = [
    {
        id: 1,
        title: 'Getting started with data-source',
        description:
            'A practical guide to setting up @gravity-ui/data-source in your React app with minimal boilerplate.',
        status: 'published',
        createdAt: '2026-04-01',
        author: MOCK_USERS[0],
    },
    {
        id: 2,
        title: 'Infinite queries explained',
        description:
            'How to implement infinite scroll using makeInfiniteQueryDataSource and useQueryData with automatic pagination.',
        status: 'draft',
        createdAt: '2026-04-15',
        author: MOCK_USERS[1],
    },
    {
        id: 3,
        title: 'React Query under the hood',
        description:
            'A deep dive into how @gravity-ui/data-source wraps TanStack Query to provide type-safe data fetching.',
        status: 'published',
        createdAt: '2026-05-01',
        author: MOCK_USERS[0],
    },
    {
        id: 4,
        title: 'Error handling patterns',
        description:
            'Best practices for handling loading and error states, with refetch strategies and user-facing feedback.',
        status: 'published',
        createdAt: '2026-05-03',
        author: MOCK_USERS[2],
    },
    {
        id: 5,
        title: 'Normalizer deep dive',
        description:
            'Understanding query normalization in data-source and how it prevents redundant network requests.',
        status: 'draft',
        createdAt: '2026-05-06',
        author: MOCK_USERS[3],
    },
];
