import React from 'react';

import {Card, Flex, Label, Text} from '@gravity-ui/uikit';

import {useQueryData} from '../..';
import {DataLoader} from '../components/DataLoader';
import {postsDataSource} from '../data-sources/posts';

export const PostsPage: React.FC = () => {
    const {data: posts, status, error, refetch} = useQueryData(postsDataSource, {});

    return (
        <DataLoader status={status} error={error} errorAction={refetch}>
            <Flex direction="column" gap={3}>
                {posts?.map((post) => {
                    return (
                        <Card
                            key={post.id}
                            type="container"
                            view="outlined"
                            spacing={{py: 4, px: 5}}
                        >
                            <Flex direction="column" gap={2}>
                                <Flex justifyContent="space-between" alignItems="center">
                                    <Text variant="subheader-2">{post.title}</Text>
                                    <Label
                                        theme={post.status === 'published' ? 'success' : 'warning'}
                                    >
                                        {post.status}
                                    </Label>
                                </Flex>
                                <Text color="secondary" variant="body-2">
                                    {post.description}
                                </Text>
                                <Text color="hint" variant="caption-2">
                                    by {post.author.name}, {post.createdAt}
                                </Text>
                            </Flex>
                        </Card>
                    );
                })}
            </Flex>
        </DataLoader>
    );
};
