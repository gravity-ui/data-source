import React from 'react';

import {InternalError} from '@gravity-ui/illustrations';
import type {PlaceholderContainerProps} from '@gravity-ui/uikit';
import {Button, PlaceholderContainer, spacing} from '@gravity-ui/uikit';

import type {ErrorViewProps} from '@gravity-ui/data-source';

import {AppError} from '../utils/error';

export interface ErrorContainerProps
    extends Omit<PlaceholderContainerProps, 'image'>,
        ErrorViewProps {
    image?: PlaceholderContainerProps['image'];
}

const extractTitle = (error: unknown) => {
    if (error instanceof AppError && error.title) {
        return error.title;
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return 'Something went wrong';
};

const extractDescription = (error: unknown) => {
    if (error instanceof AppError && error.description) {
        return error.description;
    }

    if (error instanceof Error && error.stack && process.env.NODE_ENV !== 'production') {
        return error.stack;
    }

    return undefined;
};

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
            title={title || extractTitle(error)}
            description={description || extractDescription(error)}
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
