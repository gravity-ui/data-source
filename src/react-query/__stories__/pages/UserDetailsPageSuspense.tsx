import React from 'react';

import {useSuspenseQueryData, withQueryAsyncBoundary} from '@gravity-ui/data-source';

import {ErrorContainer} from '../components/ErrorContainer';
import {LoaderContainer} from '../components/LoaderContainer';
import {UserDetails} from '../components/UserDetails';
import {userDataSource} from '../data-sources/users';

export interface UserDetailsPageSuspenseProps {
    userId: number;
}

const UserDetailsPageContent: React.FC<UserDetailsPageSuspenseProps> = ({userId}) => {
    const {data: user} = useSuspenseQueryData(userDataSource, {userId});

    return <UserDetails user={user} />;
};

export const UserDetailsPageSuspense = withQueryAsyncBoundary(
    UserDetailsPageContent,
    LoaderContainer,
    ErrorContainer,
);
