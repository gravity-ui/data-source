import {nullSymbol, undefinedSymbol} from '../../constants';
import {parseNullablePages} from '../parseNullablePages';

describe('parseNullablePages', () => {
    it('should return non-infinite data as is', () => {
        expect(parseNullablePages(undefined)).toBeUndefined();
        expect(parseNullablePages(null)).toBeNull();
        expect(parseNullablePages('data')).toBe('data');

        const plain = {value: 1};

        expect(parseNullablePages(plain)).toBe(plain);
    });

    it('should return the same object when no page is a nullable placeholder', () => {
        const data = {pages: [{value: 1}, {value: 2}], pageParams: [{}, {}]};

        expect(parseNullablePages(data)).toBe(data);
    });

    it('should unwrap nullable placeholders in pages', () => {
        const data = {pages: [{value: 1}, nullSymbol, undefinedSymbol], pageParams: [{}, {}, {}]};

        expect(parseNullablePages(data)).toEqual({
            pages: [{value: 1}, null, undefined],
            pageParams: [{}, {}, {}],
        });
        expect(data.pages[1]).toBe(nullSymbol);
    });
});
