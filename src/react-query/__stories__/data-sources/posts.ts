import {skipContext} from '../../../core';
import {MOCK_POSTS} from '../mocks/posts';
import {makePlainQueryDataSource} from '../utils/data-source';
import {AppError} from '../utils/error';
import {sleep} from '../utils/sleep';

const fetchPosts = async () => {
    await sleep(1000);

    if (Math.random() < 0.5) {
        throw new AppError({
            code: 'PERMISSION_DENIED',
            title: 'Permission denied',
            description: 'You are not allowed to load posts',
        });
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
