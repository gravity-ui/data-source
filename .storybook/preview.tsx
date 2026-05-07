import React from 'react';

import type {Preview} from '@storybook/react-webpack5';

import {ClientDataManager, DataSourceProvider} from '../src';

const dataManager = new ClientDataManager({
    defaultOptions: {
        queries: {
            retryOnMount: false,
        },
    },
});

const preview: Preview = {
    decorators: [
        (Story) => (
            <DataSourceProvider dataManager={dataManager}>
                <Story />
            </DataSourceProvider>
        ),
    ],
};

export default preview;
