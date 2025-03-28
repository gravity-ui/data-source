import type {AnyDataSource} from '../../types/DataSource';
import {composeFullKey} from '../composeFullKey';
import {composeKey} from '../composeKey';

describe('composeFullKey', () => {
    const dataSource: AnyDataSource = {
        name: 'test',
        fetch: jest.fn(),
    };

    const dataSourceWithTags: AnyDataSource = {
        name: 'test',
        fetch: jest.fn(),
        tags: () => ['tag1', 'tag2'],
    };

    it('should compose full key without tags', () => {
        const params = {id: 1};
        const result = composeFullKey(dataSource, params);
        const key = composeKey(dataSource, params);
        expect(result).toEqual(['test', key]);
    });

    it('should compose full key with tags', () => {
        const params = {id: 1};
        const result = composeFullKey(dataSourceWithTags, params);
        const key = composeKey(dataSourceWithTags, params);
        expect(result).toEqual(['test', 'tag1', 'tag2', key]);
    });
});
