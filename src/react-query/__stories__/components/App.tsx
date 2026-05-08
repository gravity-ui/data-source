import React from 'react';

import {Flex, Tab, TabList, Text, spacing} from '@gravity-ui/uikit';

export interface AppProps {
    UsersPage: React.ComponentType;
    PostsPage: React.ComponentType;
}

export const App: React.FC<AppProps> = ({UsersPage, PostsPage}) => {
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
