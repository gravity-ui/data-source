import {configureServiceWebpackConfig} from '@gravity-ui/app-builder';
import type {StorybookConfig} from '@storybook/react-webpack5';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(ts|tsx)'],
    framework: '@storybook/react-webpack5',
    addons: ['@storybook/addon-webpack5-compiler-swc'],
    core: {
        disableWhatsNewNotifications: true,
    },
    webpackFinal: (originalConfig, {configType}) => {
        const mode = configType === 'DEVELOPMENT' ? 'development' : 'production';
        return configureServiceWebpackConfig(mode, originalConfig);
    },
};

export default config;
