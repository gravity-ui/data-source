import React from 'react';

import {useQueryData} from '@gravity-ui/data-source';

import {DataLoader} from '../components/DataLoader';
import {UserDetails} from '../components/UserDetails';
import {userDataSource} from '../data-sources/users';

export interface UserDetailsPageProps {
    userId: number;
}

export const UserDetailsPage: React.FC<UserDetailsPageProps> = ({userId}) => {
    const {data: user, status, error, refetch} = useQueryData(userDataSource, {userId});

    return (
        <DataLoader status={status} error={error} errorAction={refetch}>
            {user ? <UserDetails user={user} /> : null}
        </DataLoader>
    );
};
