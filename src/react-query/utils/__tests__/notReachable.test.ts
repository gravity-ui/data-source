import {notReachable} from '../notReachable';

describe('notReachable', () => {
    it('should throw an error with default message', () => {
        const callNotReachable = () => {
            notReachable('test' as never);
        };

        expect(callNotReachable).toThrow('Not reachable state: test');
    });

    it('should throw an error with custom message', () => {
        const callNotReachable = () => {
            notReachable('test' as never, 'Custom error message');
        };

        expect(callNotReachable).toThrow('Custom error message');
    });

    it('should be used for exhaustive type checking', () => {
        const getNumberName = (num: 1 | 2 | 3): string => {
            switch (num) {
                case 1:
                    return 'one';
                case 2:
                    return 'two';
                case 3:
                    return 'three';
                default:
                    return notReachable(num);
            }
        };

        expect(getNumberName(1)).toBe('one');
        expect(getNumberName(2)).toBe('two');
        expect(getNumberName(3)).toBe('three');
    });
});
