import React from 'react';

import {Card, Flex, User} from '@gravity-ui/uikit';

import type {MockUser} from '../mocks/users';

import {UserRole} from './UserRole';

export interface UsersListProps {
    users: MockUser[];
    onSelect: (id: number) => void;
}

export const UsersList: React.FC<UsersListProps> = ({users, onSelect}) => {
    return (
        <Flex direction="column" gap={2}>
            {users.map((user) => (
                <Card
                    key={user.id}
                    type="action"
                    view="outlined"
                    spacing={{py: 3, px: 4}}
                    onClick={() => onSelect(user.id)}
                >
                    <Flex justifyContent="space-between" alignItems="center">
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
    );
};
