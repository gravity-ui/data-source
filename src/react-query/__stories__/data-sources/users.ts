import {skipContext} from '../../../core';
import {MOCK_USERS} from '../mocks/users';
import {makePlainQueryDataSource} from '../utils/data-source';
import {sleep} from '../utils/sleep';

const fetchUsers = async () => {
    await sleep(800);
    return MOCK_USERS;
};

export const usersDataSource = makePlainQueryDataSource({
    name: 'demo/users',
    fetch: skipContext(fetchUsers),
});

const fetchUser = async (request: {userId: number}) => {
    await sleep(600);

    const user = MOCK_USERS.find((u) => u.id === request.userId);

    if (!user) {
        throw new Error(`User "${request.userId}" is not found`);
    }

    return user;
};

export const userDataSource = makePlainQueryDataSource({
    name: 'demo/user',
    fetch: skipContext(fetchUser),
});
