import {withCatch} from '../withCatch';

describe('withCatch', () => {
    it('should return the result of the fetch function when it succeeds', async () => {
        const mockFetch = jest.fn().mockResolvedValue({data: 'success'});
        const mockErrorHandler = jest.fn().mockReturnValue({error: 'handled'});

        const safeFetch = withCatch(mockFetch, mockErrorHandler);
        const result = await safeFetch('arg1', 42);

        expect(mockFetch).toHaveBeenCalledWith('arg1', 42);
        expect(mockErrorHandler).not.toHaveBeenCalled();
        expect(result).toEqual({data: 'success'});
    });

    it('should call the error handler when the fetch function fails', async () => {
        const error = new Error('fetch failed');
        const mockFetch = jest.fn().mockRejectedValue(error);
        const mockErrorHandler = jest.fn().mockReturnValue({error: 'handled'});

        const safeFetch = withCatch(mockFetch, mockErrorHandler);
        const result = await safeFetch('arg1', 42);

        expect(mockFetch).toHaveBeenCalledWith('arg1', 42);
        expect(mockErrorHandler).toHaveBeenCalledWith(error);
        expect(result).toEqual({error: 'handled'});
    });

    it('should work with functions that take no parameters', async () => {
        const mockFetch = jest.fn().mockResolvedValue({data: 'success'});
        const mockErrorHandler = jest.fn().mockReturnValue({error: 'handled'});

        const safeFetch = withCatch(mockFetch, mockErrorHandler);
        const result = await safeFetch();

        expect(mockFetch).toHaveBeenCalledWith();
        expect(mockErrorHandler).not.toHaveBeenCalled();
        expect(result).toEqual({data: 'success'});
    });

    it('should work with functions that take multiple parameters', async () => {
        const mockFetch = jest.fn().mockResolvedValue({data: 'success'});
        const mockErrorHandler = jest.fn().mockReturnValue({error: 'handled'});

        const safeFetch = withCatch(mockFetch, mockErrorHandler);
        const result = await safeFetch('arg1', 42, true, {complex: 'object'});

        expect(mockFetch).toHaveBeenCalledWith('arg1', 42, true, {complex: 'object'});
        expect(mockErrorHandler).not.toHaveBeenCalled();
        expect(result).toEqual({data: 'success'});
    });

    it('should handle error handlers that return promises', async () => {
        const error = new Error('fetch failed');
        const mockFetch = jest.fn().mockRejectedValue(error);
        const mockErrorHandler = jest.fn().mockResolvedValue({error: 'async handled'});

        const safeFetch = withCatch(mockFetch, mockErrorHandler);
        const result = await safeFetch('arg1');

        expect(mockFetch).toHaveBeenCalledWith('arg1');
        expect(mockErrorHandler).toHaveBeenCalledWith(error);
        expect(result).toEqual({error: 'async handled'});
    });

    it('should preserve the type of the fetch function return value', async () => {
        interface User {
            id: number;
            name: string;
        }

        const mockFetch = jest.fn().mockResolvedValue({
            id: 1,
            name: 'John Doe',
        } as User);

        const mockErrorHandler = jest.fn().mockReturnValue(null);

        const safeFetch = withCatch<[string], User, null>(mockFetch, mockErrorHandler);
        const result = await safeFetch('user1');

        expect(result).toEqual({id: 1, name: 'John Doe'});
        // TypeScript should recognize result as User | null
        if (result !== null) {
            // This should compile without errors
            const userName = result.name;
            expect(userName).toBe('John Doe');
        }
    });

    it('should preserve the type of the error handler return value', async () => {
        interface ErrorResponse {
            code: number;
            message: string;
        }

        const error = new Error('fetch failed');
        const mockFetch = jest.fn<Promise<unknown>, [string]>().mockRejectedValue(error);

        const mockErrorHandler = jest.fn().mockReturnValue({
            code: 500,
            message: 'Internal Server Error',
        } as ErrorResponse);

        const safeFetch = withCatch<[string], unknown, ErrorResponse>(mockFetch, mockErrorHandler);
        const result = await safeFetch('user1');

        expect(mockErrorHandler).toHaveBeenCalledWith(error);

        // TypeScript should recognize result as unknown | ErrorResponse
        if (typeof result === 'object' && result !== null && 'code' in result) {
            // This should compile without errors
            const errorCode = (result as ErrorResponse).code;
            expect(errorCode).toBe(500);
        }
    });
});
