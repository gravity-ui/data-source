import {skipContext} from '../skipContext';

describe('skipContext', () => {
    it('should ignore context and query function context parameters', () => {
        const mockFn = jest.fn((arg1: string, arg2: number) => `${arg1}-${arg2}`);
        const wrappedFn = skipContext(mockFn);
        const result = wrappedFn('context', 'queryFnContext', 'hello', 42);
        expect(mockFn).toHaveBeenCalledWith('hello', 42);
        expect(result).toBe('hello-42');
    });

    it('should work with functions that have no parameters', () => {
        const mockFn = jest.fn(() => 'result');
        const wrappedFn = skipContext(mockFn);
        const result = wrappedFn('context', 'queryFnContext');
        expect(mockFn).toHaveBeenCalledWith();
        expect(result).toBe('result');
    });

    it('should work with async functions', async () => {
        const mockFn = jest.fn(async (arg: string) => `async-${arg}`);
        const wrappedFn = skipContext(mockFn);
        const result = await wrappedFn('context', 'queryFnContext', 'test');
        expect(mockFn).toHaveBeenCalledWith('test');
        expect(result).toBe('async-test');
    });

    it('should pass multiple arguments correctly', () => {
        const mockFn = jest.fn(
            (arg1: string, arg2: number, arg3: boolean) => `${arg1}-${arg2}-${arg3}`,
        );
        const wrappedFn = skipContext(mockFn);
        const result = wrappedFn('context', 'queryFnContext', 'hello', 42, true);
        expect(mockFn).toHaveBeenCalledWith('hello', 42, true);
        expect(result).toBe('hello-42-true');
    });
});
