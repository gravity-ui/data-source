import React from 'react';

import type {LoaderProps} from '@gravity-ui/uikit';
import {Flex, Loader} from '@gravity-ui/uikit';

export interface LoaderContainerProps extends Omit<LoaderProps, 'className'> {
    className?: string;
}

export const LoaderContainer: React.FC<LoaderContainerProps> = ({
    size = 'l',
    className,
    ...restProps
}) => {
    return (
        <Flex
            justifyContent="center"
            alignItems="center"
            style={{flex: 'auto', width: '100%', height: '100%'}}
            className={className}
        >
            <Loader size={size} {...restProps} />
        </Flex>
    );
};
