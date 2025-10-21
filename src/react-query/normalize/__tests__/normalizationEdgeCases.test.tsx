import {createNormalizer} from '@normy/core';
import {QueryClient} from '@tanstack/react-query';

import {updateQueriesFromMutationData} from '../normalization';

describe('normalization edge cases', () => {
    let queryClient: QueryClient;
    let normalizer: ReturnType<typeof createNormalizer>;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {retry: false},
                mutations: {retry: false},
            },
        });

        normalizer = createNormalizer({
            devLogging: false,
        });
    });

    afterEach(() => {
        queryClient.clear();
    });

    it('should work correctly with empty data', () => {
        const queryKey = ['empty'];
        queryClient.setQueryData(queryKey, []);
        normalizer.setQuery(JSON.stringify(queryKey), []);

        const mutationData = {id: '1', name: 'New'};
        expect(() => {
            updateQueriesFromMutationData(mutationData, normalizer, queryClient);
        }).not.toThrow();
    });

    it('should work correctly with null data', () => {
        const queryKey = ['null'];
        queryClient.setQueryData(queryKey, null);

        const mutationData = {id: '1', name: 'New'};
        expect(() => {
            updateQueriesFromMutationData(mutationData, normalizer, queryClient);
        }).not.toThrow();
    });

    it('should work correctly with undefined data', () => {
        const queryKey = ['undefined'];
        queryClient.setQueryData(queryKey, undefined);

        const mutationData = {id: '1', name: 'New'};
        expect(() => {
            updateQueriesFromMutationData(mutationData, normalizer, queryClient);
        }).not.toThrow();
    });

    it('should work correctly with arrays of objects', () => {
        const queryKey = ['array'];
        const data = [
            {id: '1', name: 'Item 1'},
            {id: '2', name: 'Item 2'},
        ];

        queryClient.setQueryData(queryKey, data);
        normalizer.setQuery(JSON.stringify(queryKey), data);

        const mutationData = {id: '1', name: 'Updated Item 1'};
        updateQueriesFromMutationData(mutationData, normalizer, queryClient);

        const updatedData = queryClient.getQueryData(queryKey) as Array<{
            id: string;
            name: string;
        }>;
        expect(updatedData[0].name).toBe('Updated Item 1');
        expect(updatedData[1].name).toBe('Item 2');
    });

    it('should work correctly with single objects', () => {
        const queryKey = ['single'];
        const data = {id: '1', name: 'Item'};

        queryClient.setQueryData(queryKey, data);
        normalizer.setQuery(JSON.stringify(queryKey), data);

        const mutationData = {id: '1', name: 'Updated Item'};
        updateQueriesFromMutationData(mutationData, normalizer, queryClient);

        const updatedData = queryClient.getQueryData(queryKey) as {id: string; name: string};
        expect(updatedData.name).toBe('Updated Item');
    });
});
