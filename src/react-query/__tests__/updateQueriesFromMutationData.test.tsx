import type {Data} from '@normy/core';

import {ClientDataManager} from '../ClientDataManager';

describe('updateQueriesFromMutationData', () => {
    let dataManager: ClientDataManager;

    beforeEach(() => {
        dataManager = new ClientDataManager({
            defaultOptions: {
                queries: {retry: false},
                mutations: {retry: false},
            },
            normalizerConfig: {
                devLogging: false,
            },
        });
    });

    afterEach(() => {
        dataManager.queryClient.clear();
    });

    it('should update query data based on normalized data', () => {
        expect(dataManager.normalizer).toBeDefined();

        // Set initial data in query
        const queryKey = ['users'];
        dataManager.queryClient.setQueryData(queryKey, [{id: '1', name: 'Old Name'}]);

        // Add query to normalizer
        dataManager.normalizer!.setQuery(JSON.stringify(queryKey), [{id: '1', name: 'Old Name'}]);

        // Update data via mutation
        const mutationData: Data = {id: '1', name: 'New Name'};

        dataManager.optimisticUpdate(mutationData);

        // Verify that data was updated
        const updatedData = dataManager.queryClient.getQueryData(queryKey) as Array<{
            id: string;
            name: string;
        }>;
        expect(updatedData).toBeDefined();
        expect(updatedData[0].name).toBe('New Name');
    });

    it('should update multiple queries with the same object', () => {
        expect(dataManager.normalizer).toBeDefined();

        const queryKey1 = ['users'];
        const queryKey2 = ['user', '1'];

        // Set data in both queries
        dataManager.queryClient.setQueryData(queryKey1, [{id: '1', name: 'User 1'}]);
        dataManager.queryClient.setQueryData(queryKey2, {id: '1', name: 'User 1'});

        // Add to normalizer
        dataManager.normalizer!.setQuery(JSON.stringify(queryKey1), [{id: '1', name: 'User 1'}]);
        dataManager.normalizer!.setQuery(JSON.stringify(queryKey2), {id: '1', name: 'User 1'});

        // Update via mutation
        const mutationData: Data = {id: '1', name: 'Updated User'};
        dataManager.optimisticUpdate(mutationData);

        // Check both queries
        const data1 = dataManager.queryClient.getQueryData(queryKey1) as Array<{
            id: string;
            name: string;
        }>;
        const data2 = dataManager.queryClient.getQueryData(queryKey2) as {id: string; name: string};

        expect(data1[0].name).toBe('Updated User');
        expect(data2.name).toBe('Updated User');
    });

    it('should preserve dataUpdatedAt on update', () => {
        expect(dataManager.normalizer).toBeDefined();

        const queryKey = ['users'];
        const originalUpdatedAt = Date.now();

        // Set initial data
        dataManager.queryClient.setQueryData(queryKey, [{id: '1', name: 'Old'}], {
            updatedAt: originalUpdatedAt,
        });
        dataManager.normalizer!.setQuery(JSON.stringify(queryKey), [{id: '1', name: 'Old'}]);

        // Update data
        const mutationData: Data = {id: '1', name: 'New'};
        dataManager.optimisticUpdate(mutationData);

        // Verify that dataUpdatedAt was preserved
        const cachedQuery = dataManager.queryClient.getQueryCache().find({queryKey});
        expect(cachedQuery?.state.dataUpdatedAt).toBe(originalUpdatedAt);
    });

    it('should preserve error state on update', () => {
        expect(dataManager.normalizer).toBeDefined();

        const queryKey = ['users'];
        const error = new Error('Test error');

        // Set initial data with error
        dataManager.queryClient.setQueryData(queryKey, [{id: '1', name: 'Old'}]);
        const cachedQuery = dataManager.queryClient.getQueryCache().find({queryKey});
        cachedQuery?.setState({error, status: 'error'});

        dataManager.normalizer!.setQuery(JSON.stringify(queryKey), [{id: '1', name: 'Old'}]);

        // Update data
        const mutationData: Data = {id: '1', name: 'New'};
        dataManager.optimisticUpdate(mutationData);

        // Verify that error and status were preserved
        const updatedQuery = dataManager.queryClient.getQueryCache().find({queryKey});
        expect(updatedQuery?.state.error).toBe(error);
        expect(updatedQuery?.state.status).toBe('error');
    });

    it('should preserve isInvalidated flag on update', () => {
        expect(dataManager.normalizer).toBeDefined();

        const queryKey = ['users'];

        // Set initial data and invalidate
        dataManager.queryClient.setQueryData(queryKey, [{id: '1', name: 'Old'}]);
        dataManager.queryClient.invalidateQueries({queryKey});

        dataManager.normalizer!.setQuery(JSON.stringify(queryKey), [{id: '1', name: 'Old'}]);

        const cachedQueryBefore = dataManager.queryClient.getQueryCache().find({queryKey});
        const isInvalidatedBefore = cachedQueryBefore?.state.isInvalidated;

        // Update data
        const mutationData: Data = {id: '1', name: 'New'};
        dataManager.optimisticUpdate(mutationData);

        // Verify that isInvalidated was preserved
        const cachedQueryAfter = dataManager.queryClient.getQueryCache().find({queryKey});
        expect(cachedQueryAfter?.state.isInvalidated).toBe(isInvalidatedBefore);
    });

    it('should work correctly with nested objects', () => {
        expect(dataManager.normalizer).toBeDefined();

        const queryKey = ['posts'];
        const initialData = [
            {
                id: '1',
                title: 'Post 1',
                author: {id: '10', name: 'Author 1'},
            },
        ];

        dataManager.queryClient.setQueryData(queryKey, initialData);
        dataManager.normalizer!.setQuery(JSON.stringify(queryKey), initialData);

        // Update author
        const mutationData: Data = {id: '10', name: 'Updated Author'};
        dataManager.optimisticUpdate(mutationData);

        // Verify that author was updated
        const data = dataManager.queryClient.getQueryData(queryKey) as Array<{
            id: string;
            title: string;
            author: {id: string; name: string};
        }>;
        expect(data[0].author.name).toBe('Updated Author');
    });

    it('should not throw if query is not in cache', () => {
        expect(dataManager.normalizer).toBeDefined();

        const mutationData: Data = {id: '1', name: 'New'};

        // Don't add query to cache, only to normalizer
        // This should not throw an error
        expect(() => {
            dataManager.optimisticUpdate(mutationData);
        }).not.toThrow();
    });
});
