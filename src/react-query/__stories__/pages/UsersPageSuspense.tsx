import React from 'react';

import {Button, Flex} from '@gravity-ui/uikit';

import {useSuspenseQueryData, withQueryAsyncBoundary} from '../..';
import {ErrorContainer} from '../components/ErrorContainer';
import {LoaderContainer} from '../components/LoaderContainer';
import {UsersList} from '../components/UsersList';
import {usersDataSource} from '../data-sources/users';

import {UserDetailsPageSuspense} from './UserDetailsPageSuspense';

const UsersPageContent: React.FC = () => {
    const [selectedUserId, setSelectedUserId] = React.useState<number | null>(null);

    const {data: users} = useSuspenseQueryData(usersDataSource, {});

    if (selectedUserId !== null) {
        return (
            <Flex direction="column" gap={4} style={{flex: 'auto'}}>
                <Button view="outlined" onClick={() => setSelectedUserId(null)}>
                    ← Back to users
                </Button>
                <UserDetailsPageSuspense userId={selectedUserId} />
            </Flex>
        );
    }

    return <UsersList users={users} onSelect={setSelectedUserId} />;
};

export const UsersPageSuspense = withQueryAsyncBoundary(
    UsersPageContent,
    LoaderContainer,
    ErrorContainer,
);
