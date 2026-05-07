import React from 'react';

import type {LabelProps} from '@gravity-ui/uikit';
import {Label} from '@gravity-ui/uikit';

import type {MockUserRole} from '../mocks/users';

export interface UserRoleProps extends LabelProps {
    role: MockUserRole;
}

const ROLE_THEME: Record<MockUserRole, LabelProps['theme']> = {
    admin: 'danger',
    editor: 'info',
    viewer: 'normal',
};

export const UserRole: React.FC<UserRoleProps> = ({role, ...restProps}) => {
    return (
        <Label theme={ROLE_THEME[role]} {...restProps}>
            {role}
        </Label>
    );
};
