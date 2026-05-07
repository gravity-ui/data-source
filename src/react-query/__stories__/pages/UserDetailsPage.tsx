import React from 'react';

import {Card, DefinitionList, Flex, Text, User} from '@gravity-ui/uikit';

import {useQueryData} from '../../index';
import {DataLoader} from '../components/DataLoader';
import {UserRole} from '../components/UserRole';
import {userDataSource} from '../data-sources/users';

export interface UserDetailsPageProps {
    userId: number;
}

export const UserDetailsPage: React.FC<UserDetailsPageProps> = ({userId}) => {
    const {data: user, status, error, refetch} = useQueryData(userDataSource, {userId});

    return (
        <DataLoader status={status} error={error} errorAction={refetch}>
            {user ? (
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
                            <DefinitionList.Item name="Department">
                                {user.department}
                            </DefinitionList.Item>
                        </DefinitionList>
                    </Flex>
                </Card>
            ) : null}
        </DataLoader>
    );
};
