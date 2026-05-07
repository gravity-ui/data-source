import {skipContext} from '../../../core';
import {MOCK_POSTS} from '../mocks/posts';
import {makePlainQueryDataSource} from '../utils/data-source';
import {sleep} from '../utils/sleep';

const fetchPosts = async () => {
    await sleep(1000);

    if (Math.random() < 0.5) {
        throw new Error('Network error: failed to load posts');
    }

    return MOCK_POSTS;
};

export const postsDataSource = makePlainQueryDataSource({
    name: 'demo/posts',
    fetch: skipContext(fetchPosts),
    options: {
        retry: false,
    },
});
