import React from 'react';

import {InternalError} from '@gravity-ui/illustrations';
import type {PlaceholderContainerProps} from '@gravity-ui/uikit';
import {Button, PlaceholderContainer, spacing} from '@gravity-ui/uikit';

import type {ErrorViewProps} from '../../..';
import type {AppError} from '../types/error';

export interface ErrorContainerProps
    extends Omit<PlaceholderContainerProps, 'image'>,
        ErrorViewProps<AppError> {
    image?: PlaceholderContainerProps['image'];
}

export const ErrorContainer: React.FC<ErrorContainerProps> = ({
    direction,
    size,
    image,
    title,
    description,
    error,
    action,
    ...restProps
}) => {
    return (
        <PlaceholderContainer
            direction={direction || 'column'}
            size={size || 'm'}
            image={image || <InternalError />}
            title={title || error?.title || 'Something went wrong'}
            description={description || error?.description}
            actions={
                action ? (
                    <Button className={spacing({mt: 4})} onClick={action.handler}>
                        {action.children || 'Retry'}
                    </Button>
                ) : undefined
            }
            {...restProps}
        />
    );
};
