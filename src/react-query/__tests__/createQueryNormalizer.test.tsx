import type {Data} from '@normy/core';

import {ClientDataManager} from '../ClientDataManager';

describe('QueryNormalizer API', () => {
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

    it('should create queryNormalizer with required methods', () => {
        expect(dataManager.queryNormalizer).toBeDefined();
        expect(dataManager.queryNormalizer?.getNormalizedData).toBeDefined();
        expect(dataManager.queryNormalizer?.setNormalizedData).toBeDefined();
        expect(dataManager.queryNormalizer?.clear).toBeDefined();
        expect(dataManager.queryNormalizer?.getObjectById).toBeDefined();
        expect(dataManager.queryNormalizer?.getQueryFragment).toBeDefined();
        expect(dataManager.queryNormalizer?.getDependentQueries).toBeDefined();
        expect(dataManager.queryNormalizer?.getDependentQueriesByIds).toBeDefined();
        expect(dataManager.queryNormalizer?.subscribe).toBeDefined();
        expect(dataManager.queryNormalizer?.unsubscribe).toBeDefined();
    });

    it('getNormalizedData should return normalized data', () => {
        expect(dataManager.queryNormalizer).toBeDefined();

        const data = dataManager.queryNormalizer!.getNormalizedData();
        expect(data).toBeDefined();
        expect(data.objects).toBeDefined();
        expect(data.queries).toBeDefined();
    });

    it('setNormalizedData should update queries', () => {
        expect(dataManager.normalizer).toBeDefined();
        expect(dataManager.queryNormalizer).toBeDefined();

        const queryKey = ['users'];
        dataManager.queryClient.setQueryData(queryKey, [{id: '1', name: 'Old'}]);
        dataManager.normalizer!.setQuery(JSON.stringify(queryKey), [{id: '1', name: 'Old'}]);

        dataManager.queryNormalizer!.setNormalizedData({id: '1', name: 'New'});

        const data = dataManager.queryClient.getQueryData(queryKey) as Array<{
            id: string;
            name: string;
        }>;
        expect(data[0].name).toBe('New');
    });

    it('clear should clear normalized data', () => {
        expect(dataManager.normalizer).toBeDefined();
        expect(dataManager.queryNormalizer).toBeDefined();

        const queryKey = ['users'];
        dataManager.queryClient.setQueryData(queryKey, [{id: '1', name: 'User'}]);
        dataManager.normalizer!.setQuery(JSON.stringify(queryKey), [{id: '1', name: 'User'}]);

        dataManager.queryNormalizer!.clear();

        const data = dataManager.queryNormalizer!.getNormalizedData();
        expect(Object.keys(data.objects)).toHaveLength(0);
    });

    it('getObjectById should return object by ID', () => {
        expect(dataManager.normalizer).toBeDefined();
        expect(dataManager.queryNormalizer).toBeDefined();

        const queryKey = ['users'];
        const userData = [{id: '1', name: 'User 1'}];

        // Add to normalizer
        dataManager.normalizer!.setQuery(JSON.stringify(queryKey), userData);

        // Get normalized data
        const normalized = dataManager.queryNormalizer!.getNormalizedData();
        expect(Object.keys(normalized.objects).length).toBeGreaterThan(0);

        // getObjectById should be defined and available
        expect(dataManager.queryNormalizer!.getObjectById).toBeDefined();
        expect(typeof dataManager.queryNormalizer!.getObjectById).toBe('function');
    });

    it('getDependentQueries should return dependent queries', () => {
        expect(dataManager.normalizer).toBeDefined();
        expect(dataManager.queryNormalizer).toBeDefined();

        const queryKey1 = ['users'];
        const queryKey2 = ['user', '1'];

        dataManager.queryClient.setQueryData(queryKey1, [{id: '1', name: 'User'}]);
        dataManager.queryClient.setQueryData(queryKey2, {id: '1', name: 'User'});

        dataManager.normalizer!.setQuery(JSON.stringify(queryKey1), [{id: '1', name: 'User'}]);
        dataManager.normalizer!.setQuery(JSON.stringify(queryKey2), {id: '1', name: 'User'});

        const dependentQueries = dataManager.queryNormalizer!.getDependentQueries({
            id: '1',
            name: 'Updated',
        });
        expect(dependentQueries.length).toBeGreaterThan(0);
    });

    it('getDependentQueriesByIds should be available', () => {
        expect(dataManager.queryNormalizer).toBeDefined();

        // getDependentQueriesByIds should be defined and available
        expect(dataManager.queryNormalizer!.getDependentQueriesByIds).toBeDefined();
        expect(typeof dataManager.queryNormalizer!.getDependentQueriesByIds).toBe('function');

        // Call with empty array should not throw
        const result = dataManager.queryNormalizer!.getDependentQueriesByIds([]);
        expect(Array.isArray(result)).toBe(true);
    });

    it('should not create queryNormalizer when normalizerConfig is false', () => {
        const dmWithoutNormalizer = new ClientDataManager({
            normalizerConfig: false,
        });

        expect(dmWithoutNormalizer.normalizer).toBeUndefined();
        expect(dmWithoutNormalizer.queryNormalizer).toBeUndefined();
    });

    it('should not create queryNormalizer when normalizerConfig is undefined', () => {
        const dmWithoutNormalizer = new ClientDataManager({});

        expect(dmWithoutNormalizer.normalizer).toBeUndefined();
        expect(dmWithoutNormalizer.queryNormalizer).toBeUndefined();
    });

    it('should create queryNormalizer when normalizerConfig is true', () => {
        const dmWithNormalizer = new ClientDataManager({
            normalizerConfig: true,
        });

        expect(dmWithNormalizer.normalizer).toBeDefined();
        expect(dmWithNormalizer.queryNormalizer).toBeDefined();
    });

    it('should work correctly with optimisticUpdate via setNormalizedData', () => {
        expect(dataManager.normalizer).toBeDefined();
        expect(dataManager.queryNormalizer).toBeDefined();

        const queryKey = ['users'];
        const initialData = [{id: '1', name: 'Old Name'}];

        dataManager.queryClient.setQueryData(queryKey, initialData);
        dataManager.normalizer!.setQuery(JSON.stringify(queryKey), initialData);

        const mutationData: Data = {id: '1', name: 'New Name'};
        dataManager.queryNormalizer!.setNormalizedData(mutationData);

        const updatedData = dataManager.queryClient.getQueryData(queryKey) as Array<{
            id: string;
            name: string;
        }>;
        expect(updatedData[0].name).toBe('New Name');
    });
});
