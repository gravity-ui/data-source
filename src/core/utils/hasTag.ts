import type {DataSourceKey, DataSourceTag} from '../types/DataSource';

export const hasTag = (key: DataSourceKey, tag: DataSourceTag) => {
    if (!Array.isArray(key)) {
        return false;
    }

    const index = key.indexOf(tag);

    // First element — data source name
    // Last element — full key
    // Skip them for consistency
    return index > 0 && index < key.length - 2;
};
