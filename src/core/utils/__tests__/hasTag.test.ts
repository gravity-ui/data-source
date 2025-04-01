import type {DataSourceKey, DataSourceTag} from '../../types/DataSource';
import {hasTag} from '../hasTag';

describe('hasTag', () => {
    it('should return true when key contains tag', () => {
        const key: DataSourceKey = ['dataSource', 'tag1', 'tag2', 'fullKey'];
        const tag: DataSourceTag = 'tag1';
        expect(hasTag(key, tag)).toBe(true);
    });

    it('should return false when key does not contain tag', () => {
        const key: DataSourceKey = ['dataSource', 'tag1', 'tag2', 'fullKey'];
        const tag: DataSourceTag = 'tag3';
        expect(hasTag(key, tag)).toBe(false);
    });

    it('should return false when tag is at first position (data source name)', () => {
        const key: DataSourceKey = ['tag1', 'tag2', 'tag3', 'fullKey'];
        const tag: DataSourceTag = 'tag1';
        expect(hasTag(key, tag)).toBe(false);
    });

    it('should return false when tag is at last position (full key)', () => {
        const key: DataSourceKey = ['dataSource', 'tag1', 'tag2', 'tag3'];
        const tag: DataSourceTag = 'tag3';
        expect(hasTag(key, tag)).toBe(false);
    });

    it('should return false when key is not an array', () => {
        const key = 'not an array';
        const tag: DataSourceTag = 'tag';
        expect(hasTag(key as unknown as DataSourceKey, tag)).toBe(false);
    });
});
