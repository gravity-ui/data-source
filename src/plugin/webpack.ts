import {createWebpackPlugin} from 'unplugin';

import {dataSourceLazyUnpluginFactory} from './core';

export default createWebpackPlugin(dataSourceLazyUnpluginFactory);
