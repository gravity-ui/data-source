import path from 'node:path';

import {configureServiceWebpackConfig} from '@gravity-ui/app-builder';
import type {StorybookConfig} from '@storybook/react-webpack5';

import dataSourceLazyPlugin from '../src/plugin/webpack';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(ts|tsx)'],
    framework: '@storybook/react-webpack5',
    addons: ['@storybook/addon-webpack5-compiler-swc'],
    core: {
        disableWhatsNewNotifications: true,
    },
    webpackFinal: async (originalConfig, {configType}) => {
        const mode = configType === 'DEVELOPMENT' ? 'development' : 'production';
        const webpackConfig = await configureServiceWebpackConfig(mode, originalConfig);

        webpackConfig.resolve ??= {};
        webpackConfig.resolve.alias = {
            ...webpackConfig.resolve.alias,
            '@gravity-ui/data-source': path.resolve(__dirname, '../src/index.ts'),
        };

        webpackConfig.plugins ??= [];
        webpackConfig.plugins.push(dataSourceLazyPlugin());

        return webpackConfig;
    },
};

export default config;
