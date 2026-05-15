import {createRollupPlugin} from 'unplugin';

import {dataSourceLazyUnpluginFactory} from './core';

export default createRollupPlugin(dataSourceLazyUnpluginFactory);
