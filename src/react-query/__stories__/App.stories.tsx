import React from 'react';

import {Flex, Tab, TabList, Text, spacing} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {PostsPage} from './pages/PostsPage';
import {UsersPage} from './pages/UsersPage';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState('users');

    return (
        <Flex
            maxWidth={600}
            minHeight={600}
            direction="column"
            spacing={{p: 8}}
            style={{margin: '0 auto'}}
        >
            <Flex direction="column" gap={1}>
                <Text variant="display-2">Data Source Demo</Text>
                <Text variant="body-2" color="secondary">
                    A demo SPA built with @gravity-ui/data-source and @gravity-ui/uikit
                </Text>
            </Flex>
            <TabList
                className={spacing({my: 6})}
                size="l"
                value={activeTab}
                onUpdate={setActiveTab}
            >
                <Tab value="users">Users</Tab>
                <Tab value="posts">Posts</Tab>
            </TabList>
            <Flex direction="column" style={{flex: 'auto'}}>
                {activeTab === 'users' ? <UsersPage /> : null}
                {activeTab === 'posts' ? <PostsPage /> : null}
            </Flex>
        </Flex>
    );
};

const meta: Meta<typeof App> = {
    title: 'react-query/App',
    component: App,
};

export default meta;

type Story = StoryObj<typeof App>;

export const Default: Story = {};
