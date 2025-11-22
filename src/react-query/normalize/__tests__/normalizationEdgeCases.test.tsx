import type {Data} from '@normy/core';

import {ClientDataManager} from '../../ClientDataManager';

describe('normalization edge cases', () => {
    let dataManager: ClientDataManager;

    beforeEach(() => {
        dataManager = new ClientDataManager(
            {
                defaultOptions: {
                    queries: {retry: false},
                    mutations: {retry: false},
                },
            },
            {
                normalizerConfig: {
                    devLogging: false,
                },
            },
        );
    });

    afterEach(() => {
        dataManager.queryClient.clear();
    });

    it('should work correctly with empty data', () => {
        if (!dataManager.normalizer) {
            throw new Error('Normalizer should be initialized');
        }

        const queryKey = ['empty'];
        dataManager.queryClient.setQueryData(queryKey, []);
        dataManager.normalizer.setQuery(JSON.stringify(queryKey), []);

        const mutationData: Data = {id: '1', name: 'New'};
        expect(() => {
            dataManager.optimisticUpdate(mutationData);
        }).not.toThrow();
    });

    it('should work correctly with null data', () => {
        if (!dataManager.normalizer) {
            throw new Error('Normalizer should be initialized');
        }

        const queryKey = ['null'];
        dataManager.queryClient.setQueryData(queryKey, null);

        const mutationData: Data = {id: '1', name: 'New'};
        expect(() => {
            dataManager.optimisticUpdate(mutationData);
        }).not.toThrow();
    });

    it('should work correctly with undefined data', () => {
        if (!dataManager.normalizer) {
            throw new Error('Normalizer should be initialized');
        }

        const queryKey = ['undefined'];
        dataManager.queryClient.setQueryData(queryKey, undefined);

        const mutationData: Data = {id: '1', name: 'New'};
        expect(() => {
            dataManager.optimisticUpdate(mutationData);
        }).not.toThrow();
    });

    it('should work correctly with arrays of objects', () => {
        if (!dataManager.normalizer) {
            throw new Error('Normalizer should be initialized');
        }

        const queryKey = ['array'];
        const data = [
            {id: '1', name: 'Item 1'},
            {id: '2', name: 'Item 2'},
        ];

        dataManager.queryClient.setQueryData(queryKey, data);
        dataManager.normalizer.setQuery(JSON.stringify(queryKey), data);

        const mutationData: Data = {id: '1', name: 'Updated Item 1'};
        dataManager.optimisticUpdate(mutationData);

        const updatedData = dataManager.queryClient.getQueryData(queryKey) as Array<{
            id: string;
            name: string;
        }>;
        expect(updatedData[0].name).toBe('Updated Item 1');
        expect(updatedData[1].name).toBe('Item 2');
    });

    it('should work correctly with single objects', () => {
        if (!dataManager.normalizer) {
            throw new Error('Normalizer should be initialized');
        }

        const queryKey = ['single'];
        const data = {id: '1', name: 'Item'};

        dataManager.queryClient.setQueryData(queryKey, data);
        dataManager.normalizer.setQuery(JSON.stringify(queryKey), data);

        const mutationData: Data = {id: '1', name: 'Updated Item'};
        dataManager.optimisticUpdate(mutationData);

        const updatedData = dataManager.queryClient.getQueryData(queryKey) as {
            id: string;
            name: string;
        };
        expect(updatedData.name).toBe('Updated Item');
    });
});
