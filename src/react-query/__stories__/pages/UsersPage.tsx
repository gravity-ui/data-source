import React from 'react';

import {Button, Flex} from '@gravity-ui/uikit';

import {useQueryData} from '@gravity-ui/data-source';

import {DataLoader} from '../components/DataLoader';
import {UsersList} from '../components/UsersList';
import {usersDataSource} from '../data-sources/users';
import type {MockUser} from '../mocks/users';

import {UserDetailsPage} from './UserDetailsPage';

const EMPTY_USERS: MockUser[] = [];

export const UsersPage: React.FC = () => {
    const [selectedUserId, setSelectedUserId] = React.useState<number | null>(null);

    const {data: users = EMPTY_USERS, status, error, refetch} = useQueryData(usersDataSource, {});

    if (selectedUserId !== null) {
        return (
            <Flex direction="column" gap={4} style={{flex: 'auto'}}>
                <Button view="outlined" onClick={() => setSelectedUserId(null)}>
                    ← Back to users
                </Button>
                <UserDetailsPage userId={selectedUserId} />
            </Flex>
        );
    }

    return (
        <DataLoader status={status} error={error} errorAction={refetch}>
            <UsersList users={users} onSelect={setSelectedUserId} />
        </DataLoader>
    );
};
