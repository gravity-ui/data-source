import {createEsbuildPlugin} from 'unplugin';

import {dataSourceLazyUnpluginFactory} from './core';

export default createEsbuildPlugin(dataSourceLazyUnpluginFactory);
