import React from 'react';

import {Flex, Skeleton} from '@gravity-ui/uikit';

import {useSuspenseQueryData, withQueryAsyncBoundary} from '@gravity-ui/data-source';

import {ErrorContainer} from '../components/ErrorContainer';
import {PostsList} from '../components/PostsList';
import {postsDataSource} from '../data-sources/posts';

const PostsPageContent: React.FC = () => {
    const {data: posts} = useSuspenseQueryData(postsDataSource, {});

    return <PostsList posts={posts} />;
};

export const PostsPageSuspense = withQueryAsyncBoundary(
    PostsPageContent,
    () => (
        <Flex direction="column" gap={3}>
            <Skeleton style={{height: 126}} />
            <Skeleton style={{height: 126}} />
            <Skeleton style={{height: 126}} />
        </Flex>
    ),
    ErrorContainer,
);
