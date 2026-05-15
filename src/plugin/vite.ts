import {createVitePlugin} from 'unplugin';

import {dataSourceLazyUnpluginFactory} from './core';

export default createVitePlugin(dataSourceLazyUnpluginFactory);
