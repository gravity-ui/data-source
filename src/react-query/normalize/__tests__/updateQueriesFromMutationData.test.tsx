import {createNormalizer} from '@normy/core';
import {QueryClient} from '@tanstack/react-query';

import {updateQueriesFromMutationData} from '../normalization';

describe('updateQueriesFromMutationData', () => {
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

    it('should update query data based on normalized data', () => {
        // Set initial data in query
        const queryKey = ['users'];
        queryClient.setQueryData(queryKey, [{id: '1', name: 'Old Name'}]);

        // Add query to normalizer
        normalizer.setQuery(JSON.stringify(queryKey), [{id: '1', name: 'Old Name'}]);

        // Update data via mutation
        const mutationData = {id: '1', name: 'New Name'};

        updateQueriesFromMutationData(mutationData, normalizer, queryClient);

        // Verify that data was updated
        const updatedData = queryClient.getQueryData(queryKey) as Array<{
            id: string;
            name: string;
        }>;
        expect(updatedData).toBeDefined();
        expect(updatedData[0].name).toBe('New Name');
    });

    it('should update multiple queries with the same object', () => {
        const queryKey1 = ['users'];
        const queryKey2 = ['user', '1'];

        // Set data in both queries
        queryClient.setQueryData(queryKey1, [{id: '1', name: 'User 1'}]);
        queryClient.setQueryData(queryKey2, {id: '1', name: 'User 1'});

        // Add to normalizer
        normalizer.setQuery(JSON.stringify(queryKey1), [{id: '1', name: 'User 1'}]);
        normalizer.setQuery(JSON.stringify(queryKey2), {id: '1', name: 'User 1'});

        // Update via mutation
        const mutationData = {id: '1', name: 'Updated User'};
        updateQueriesFromMutationData(mutationData, normalizer, queryClient);

        // Check both queries
        const data1 = queryClient.getQueryData(queryKey1) as Array<{id: string; name: string}>;
        const data2 = queryClient.getQueryData(queryKey2) as {id: string; name: string};

        expect(data1[0].name).toBe('Updated User');
        expect(data2.name).toBe('Updated User');
    });

    it('should preserve dataUpdatedAt on update', () => {
        const queryKey = ['users'];
        const originalUpdatedAt = Date.now();

        // Set initial data
        queryClient.setQueryData(queryKey, [{id: '1', name: 'Old'}], {
            updatedAt: originalUpdatedAt,
        });
        normalizer.setQuery(JSON.stringify(queryKey), [{id: '1', name: 'Old'}]);

        // Update data
        updateQueriesFromMutationData({id: '1', name: 'New'}, normalizer, queryClient);

        // Verify that dataUpdatedAt was preserved
        const cachedQuery = queryClient.getQueryCache().find({queryKey});
        expect(cachedQuery?.state.dataUpdatedAt).toBe(originalUpdatedAt);
    });

    it('should preserve error state on update', () => {
        const queryKey = ['users'];
        const error = new Error('Test error');

        // Set initial data with error
        queryClient.setQueryData(queryKey, [{id: '1', name: 'Old'}]);
        const cachedQuery = queryClient.getQueryCache().find({queryKey});
        cachedQuery?.setState({error, status: 'error'});

        normalizer.setQuery(JSON.stringify(queryKey), [{id: '1', name: 'Old'}]);

        // Update data
        updateQueriesFromMutationData({id: '1', name: 'New'}, normalizer, queryClient);

        // Verify that error and status were preserved
        const updatedQuery = queryClient.getQueryCache().find({queryKey});
        expect(updatedQuery?.state.error).toBe(error);
        expect(updatedQuery?.state.status).toBe('error');
    });

    it('should preserve isInvalidated flag on update', () => {
        const queryKey = ['users'];

        // Set initial data and invalidate
        queryClient.setQueryData(queryKey, [{id: '1', name: 'Old'}]);
        queryClient.invalidateQueries({queryKey});

        normalizer.setQuery(JSON.stringify(queryKey), [{id: '1', name: 'Old'}]);

        const cachedQueryBefore = queryClient.getQueryCache().find({queryKey});
        const isInvalidatedBefore = cachedQueryBefore?.state.isInvalidated;

        // Update data
        updateQueriesFromMutationData({id: '1', name: 'New'}, normalizer, queryClient);

        // Verify that isInvalidated was preserved
        const cachedQueryAfter = queryClient.getQueryCache().find({queryKey});
        expect(cachedQueryAfter?.state.isInvalidated).toBe(isInvalidatedBefore);
    });

    it('should work correctly with nested objects', () => {
        const queryKey = ['posts'];
        const initialData = [
            {
                id: '1',
                title: 'Post 1',
                author: {id: '10', name: 'Author 1'},
            },
        ];

        queryClient.setQueryData(queryKey, initialData);
        normalizer.setQuery(JSON.stringify(queryKey), initialData);

        // Update author
        const mutationData = {id: '10', name: 'Updated Author'};
        updateQueriesFromMutationData(mutationData, normalizer, queryClient);

        // Verify that author was updated
        const data = queryClient.getQueryData(queryKey) as Array<{
            id: string;
            title: string;
            author: {id: string; name: string};
        }>;
        expect(data[0].author.name).toBe('Updated Author');
    });

    it('should not throw if query is not in cache', () => {
        const mutationData = {id: '1', name: 'New'};

        // Don't add query to cache, only to normalizer
        // This should not throw an error
        expect(() => {
            updateQueriesFromMutationData(mutationData, normalizer, queryClient);
        }).not.toThrow();
    });
});
