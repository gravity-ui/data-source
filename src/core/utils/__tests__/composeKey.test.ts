import {idle} from '../../constants';
import type {AnyDataSource} from '../../types/DataSource';
import {composeKey} from '../composeKey';

describe('composeKey', () => {
    const dataSource: AnyDataSource = {
        name: 'test',
        fetch: jest.fn(),
    };

    it('should compose key with idle params', () => {
        const result = composeKey(dataSource, idle);
        expect(result).toBe('test:idle');
    });

    it('should compose key with string param', () => {
        const params = 'string';
        const result = composeKey(dataSource, params);
        expect(result).toBe('test("string")');
    });

    it('should compose key with object param', () => {
        const params = {id: 1};
        const result = composeKey(dataSource, params);
        expect(result).toMatch(/^test\(.+\)$/);
    });

    it('should compose key with array param', () => {
        const params = [1, 2, 3];
        const result = composeKey(dataSource, params);
        expect(result).toMatch(/^test\(.+\)$/);
    });
});
