import React from 'react';

import type {DataLoaderProps as DataLoaderPropsBase} from '@gravity-ui/data-source';
import {DataLoader as DataLoaderBase} from '@gravity-ui/data-source';

import type {ErrorContainerProps} from './ErrorContainer';
import {ErrorContainer} from './ErrorContainer';
import type {LoaderContainerProps} from './LoaderContainer';
import {LoaderContainer} from './LoaderContainer';

export interface DataLoaderProps
    extends Omit<
        DataLoaderPropsBase<unknown, LoaderContainerProps, ErrorContainerProps>,
        'LoadingView' | 'ErrorView'
    > {
    LoadingView?: React.ComponentType<LoaderContainerProps>;
    ErrorView?: React.ComponentType<ErrorContainerProps>;
}

export const DataLoader: React.FC<DataLoaderProps> = ({
    LoadingView = LoaderContainer,
    ErrorView = ErrorContainer,
    ...restProps
}) => {
    return <DataLoaderBase LoadingView={LoadingView} ErrorView={ErrorView} {...restProps} />;
};
