import {nullSymbol, undefinedSymbol} from '../../constants';
import {formatNullableValue} from '../formatNullableValue';

describe('formatNullableValue', () => {
    it('should return undefinedSymbol for undefined', () => {
        expect(formatNullableValue(undefined)).toBe(undefinedSymbol);
    });

    it('should return nullSymbol for null', () => {
        expect(formatNullableValue(null)).toBe(nullSymbol);
    });

    it('should return the value for non-nullable values', () => {
        expect(formatNullableValue(42)).toBe(42);
        expect(formatNullableValue(0)).toBe(0);
        expect(formatNullableValue('test')).toBe('test');
        expect(formatNullableValue('')).toBe('');
        expect(formatNullableValue(true)).toBe(true);
        expect(formatNullableValue(false)).toBe(false);

        const obj = {a: 1};
        expect(formatNullableValue(obj)).toBe(obj);

        const arr = [1, 2, 3];
        expect(formatNullableValue(arr)).toBe(arr);
    });
});
