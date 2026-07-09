import React from 'react';

import {Card, DefinitionList, Flex, Text, User} from '@gravity-ui/uikit';

import type {MockUser} from '../mocks/users';

import {UserRole} from './UserRole';

export interface UserDetailsProps {
    user: MockUser;
}

export const UserDetails: React.FC<UserDetailsProps> = ({user}) => {
    return (
        <Card type="container" view="raised" spacing={{p: 6}}>
            <Flex direction="column" gap={5}>
                <Flex justifyContent="space-between" alignItems="center" gap={4}>
                    <User
                        size="l"
                        avatar={{theme: 'brand', text: user.name}}
                        name={<Text variant="subheader-3">{user.name}</Text>}
                        description={user.email}
                    />
                    <UserRole role={user.role} size="m" />
                </Flex>
                <DefinitionList nameMaxWidth={140}>
                    <DefinitionList.Item name="User ID" copyText={user.id.toString()}>
                        #{user.id}
                    </DefinitionList.Item>
                    <DefinitionList.Item name="Department">{user.department}</DefinitionList.Item>
                </DefinitionList>
            </Flex>
        </Card>
    );
};
