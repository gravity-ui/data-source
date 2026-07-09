import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {App} from './components/App';
import {PostsPage} from './pages/PostsPage';
import {PostsPageSuspense} from './pages/PostsPageSuspense';
import {UsersPage} from './pages/UsersPage';
import {UsersPageSuspense} from './pages/UsersPageSuspense';

const meta: Meta<typeof App> = {
    title: 'react-query/App',
    component: App,
};

export default meta;

type Story = StoryObj<typeof App>;

export const Default: Story = {
    args: {
        UsersPage: UsersPage,
        PostsPage: PostsPage,
    },
};

export const Lazy: Story = {
    args: {
        UsersPage: UsersPageSuspense.Lazy,
        PostsPage: PostsPageSuspense.Lazy,
    },
};
