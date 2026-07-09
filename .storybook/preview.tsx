/* eslint-disable import/order */
import React from 'react';

import {ThemeProvider} from '@gravity-ui/uikit';
import type {Preview} from '@storybook/react-webpack5';

import {ClientDataManager, DataSourceProvider} from '@gravity-ui/data-source';

import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import '@gravity-ui/illustrations/styles/styles.scss';

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
                <ThemeProvider theme="light">
                    <Story />
                </ThemeProvider>
            </DataSourceProvider>
        ),
    ],
};

export default preview;
