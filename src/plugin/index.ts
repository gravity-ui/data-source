import {createUnplugin} from 'unplugin';

import {dataSourceLazyUnpluginFactory} from './core';

export const DataSourceLazyPlugin = /* #__PURE__ */ createUnplugin(dataSourceLazyUnpluginFactory);
export default DataSourceLazyPlugin;

export * from './core';
