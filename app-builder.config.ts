import {defineConfig} from '@gravity-ui/app-builder';

export default defineConfig({
    lib: {
        internalDirs: ['.storybook', '**/__tests__', '**/__stories__', 'plugin'],
    },
});
