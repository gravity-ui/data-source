import {createRspackPlugin} from 'unplugin';

import {dataSourceLazyUnpluginFactory} from './core';

export default createRspackPlugin(dataSourceLazyUnpluginFactory);
