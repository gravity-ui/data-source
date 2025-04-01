import {nullSymbol, undefinedSymbol} from '../../constants';
import {parseNullableValue} from '../parseNullableValue';

describe('parseNullableValue', () => {
    it('should return undefined for undefinedSymbol', () => {
        expect(parseNullableValue(undefinedSymbol)).toBeUndefined();
    });

    it('should return null for nullSymbol', () => {
        expect(parseNullableValue(nullSymbol)).toBeNull();
    });

    it('should return the value for non-symbol values', () => {
        expect(parseNullableValue(42)).toBe(42);
        expect(parseNullableValue(0)).toBe(0);
        expect(parseNullableValue('test')).toBe('test');
        expect(parseNullableValue('')).toBe('');
        expect(parseNullableValue(true)).toBe(true);
        expect(parseNullableValue(false)).toBe(false);

        const obj = {a: 1};
        expect(parseNullableValue(obj)).toBe(obj);

        const arr = [1, 2, 3];
        expect(parseNullableValue(arr)).toBe(arr);
    });
});
