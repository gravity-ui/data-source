import React from 'react';

import {Button, Card, Flex, User} from '@gravity-ui/uikit';

import {useQueryData} from '../..';
import {DataLoader} from '../components/DataLoader';
import {UserRole} from '../components/UserRole';
import {usersDataSource} from '../data-sources/users';

import {UserDetailsPage} from './UserDetailsPage';

export const UsersPage: React.FC = () => {
    const [selectedUserId, setSelectedUserId] = React.useState<number | null>(null);

    const {data: users, status, error, refetch} = useQueryData(usersDataSource, {});

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
            <Flex direction="column" gap={2}>
                {users?.map((user) => (
                    <Card
                        key={user.id}
                        type="action"
                        view="outlined"
                        spacing={{py: 3, px: 4}}
                        onClick={() => setSelectedUserId(user.id)}
                    >
                        <Flex alignItems="center" justifyContent="space-between">
                            <User
                                avatar={{theme: 'brand', text: user.name}}
                                name={user.name}
                                description={user.email}
                            />
                            <UserRole role={user.role} />
                        </Flex>
                    </Card>
                ))}
            </Flex>
        </DataLoader>
    );
};
