import {getError} from '../getError';

describe('getError', () => {
    it('should return null when no errors', () => {
        const states = [{error: null}, {error: null}, {error: null}];
        expect(getError(states)).toBeNull();
    });

    it('should return the first error found', () => {
        const error1 = 'Error 1';
        const error2 = 'Error 2';
        const states = [{error: null}, {error: error1}, {error: error2}];
        expect(getError(states)).toBe(error1);
    });

    it('should handle empty array', () => {
        expect(getError([])).toBeNull();
    });
});
