import React from 'react';

import {useQueryData} from '../..';
import {DataLoader} from '../components/DataLoader';
import {PostsList} from '../components/PostsList';
import {postsDataSource} from '../data-sources/posts';
import type {MockPost} from '../mocks/posts';

const EMPTY_POSTS: MockPost[] = [];

export const PostsPage: React.FC = () => {
    const {data: posts = EMPTY_POSTS, status, error, refetch} = useQueryData(postsDataSource, {});

    return (
        <DataLoader status={status} error={error} errorAction={refetch}>
            <PostsList posts={posts} />
        </DataLoader>
    );
};
