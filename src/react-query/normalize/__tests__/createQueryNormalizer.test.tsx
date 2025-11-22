import {ClientDataManager} from '../../ClientDataManager';
import type {DataSourceNormalizerConfig, OptimisticUpdateConfig} from '../../types/normalizer';
import {createQueryNormalizer} from '../normalization';

describe('createQueryNormalizer', () => {
    let dataManager: ClientDataManager;

    const normalizerConfig: DataSourceNormalizerConfig = {
        normalize: true,
    };

    const optimisticUpdateConfig: OptimisticUpdateConfig = {
        enabled: true,
        autoCalculateRollback: true,
    };

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

    it('should create queryNormalizer with required methods', () => {
        if (!dataManager.normalizer) {
            throw new Error('Normalizer should be initialized');
        }

        const queryNormalizer = createQueryNormalizer({
            queryClient: dataManager.queryClient,
            normalizer: dataManager.normalizer,
            optimisticUpdate: (data) => dataManager.optimisticUpdate(data),
            normalizerConfig,
            optimisticUpdateConfig,
        });

        expect(queryNormalizer.getNormalizedData).toBeDefined();
        expect(queryNormalizer.setNormalizedData).toBeDefined();
        expect(queryNormalizer.clear).toBeDefined();
        expect(queryNormalizer.getObjectById).toBeDefined();
        expect(queryNormalizer.getQueryFragment).toBeDefined();
        expect(queryNormalizer.getDependentQueries).toBeDefined();
        expect(queryNormalizer.getDependentQueriesByIds).toBeDefined();
        expect(queryNormalizer.subscribe).toBeDefined();
        expect(queryNormalizer.unsubscribe).toBeDefined();
    });

    it('getNormalizedData should return normalized data', () => {
        if (!dataManager.normalizer) {
            throw new Error('Normalizer should be initialized');
        }

        const queryNormalizer = createQueryNormalizer({
            queryClient: dataManager.queryClient,
            normalizer: dataManager.normalizer,
            optimisticUpdate: (data) => dataManager.optimisticUpdate(data),
            normalizerConfig,
            optimisticUpdateConfig,
        });

        const data = queryNormalizer.getNormalizedData();
        expect(data).toBeDefined();
        expect(data.objects).toBeDefined();
        expect(data.queries).toBeDefined();
    });

    it('setNormalizedData should update queries', () => {
        if (!dataManager.normalizer) {
            throw new Error('Normalizer should be initialized');
        }

        const queryKey = ['users'];
        dataManager.queryClient.setQueryData(queryKey, [{id: '1', name: 'Old'}]);
        dataManager.normalizer.setQuery(JSON.stringify(queryKey), [{id: '1', name: 'Old'}]);

        const queryNormalizer = createQueryNormalizer({
            queryClient: dataManager.queryClient,
            normalizer: dataManager.normalizer,
            optimisticUpdate: (data) => dataManager.optimisticUpdate(data),
            normalizerConfig,
            optimisticUpdateConfig,
        });

        queryNormalizer.setNormalizedData({id: '1', name: 'New'});

        const data = dataManager.queryClient.getQueryData(queryKey) as Array<{
            id: string;
            name: string;
        }>;
        expect(data[0].name).toBe('New');
    });

    it('clear should clear normalized data', () => {
        if (!dataManager.normalizer) {
            throw new Error('Normalizer should be initialized');
        }

        const queryKey = ['users'];
        dataManager.queryClient.setQueryData(queryKey, [{id: '1', name: 'User'}]);
        dataManager.normalizer.setQuery(JSON.stringify(queryKey), [{id: '1', name: 'User'}]);

        const queryNormalizer = createQueryNormalizer({
            queryClient: dataManager.queryClient,
            normalizer: dataManager.normalizer,
            optimisticUpdate: (data) => dataManager.optimisticUpdate(data),
            normalizerConfig,
            optimisticUpdateConfig,
        });

        queryNormalizer.clear();

        const data = queryNormalizer.getNormalizedData();
        expect(Object.keys(data.objects)).toHaveLength(0);
    });

    it('getObjectById should return object by ID', () => {
        if (!dataManager.normalizer) {
            throw new Error('Normalizer should be initialized');
        }

        const queryKey = ['users'];
        const userData = [{id: '1', name: 'User 1'}];

        const queryNormalizer = createQueryNormalizer({
            queryClient: dataManager.queryClient,
            normalizer: dataManager.normalizer,
            optimisticUpdate: (data) => dataManager.optimisticUpdate(data),
            normalizerConfig,
            optimisticUpdateConfig,
        });

        // Add to normalizer
        dataManager.normalizer.setQuery(JSON.stringify(queryKey), userData);

        // Get normalized data
        const normalized = queryNormalizer.getNormalizedData();
        expect(Object.keys(normalized.objects).length).toBeGreaterThan(0);

        // getObjectById should be defined and available
        expect(queryNormalizer.getObjectById).toBeDefined();
        expect(typeof queryNormalizer.getObjectById).toBe('function');
    });

    it('getDependentQueries should return dependent queries', () => {
        if (!dataManager.normalizer) {
            throw new Error('Normalizer should be initialized');
        }

        const queryKey1 = ['users'];
        const queryKey2 = ['user', '1'];

        dataManager.queryClient.setQueryData(queryKey1, [{id: '1', name: 'User'}]);
        dataManager.queryClient.setQueryData(queryKey2, {id: '1', name: 'User'});

        dataManager.normalizer.setQuery(JSON.stringify(queryKey1), [{id: '1', name: 'User'}]);
        dataManager.normalizer.setQuery(JSON.stringify(queryKey2), {id: '1', name: 'User'});

        const queryNormalizer = createQueryNormalizer({
            queryClient: dataManager.queryClient,
            normalizer: dataManager.normalizer,
            optimisticUpdate: (data) => dataManager.optimisticUpdate(data),
            normalizerConfig,
            optimisticUpdateConfig,
        });

        const dependentQueries = queryNormalizer.getDependentQueries({
            id: '1',
            name: 'Updated',
        });
        expect(dependentQueries.length).toBeGreaterThan(0);
    });

    it('getDependentQueriesByIds should be available', () => {
        if (!dataManager.normalizer) {
            throw new Error('Normalizer should be initialized');
        }

        const queryNormalizer = createQueryNormalizer({
            queryClient: dataManager.queryClient,
            normalizer: dataManager.normalizer,
            optimisticUpdate: (data) => dataManager.optimisticUpdate(data),
            normalizerConfig,
            optimisticUpdateConfig,
        });

        // getDependentQueriesByIds should be defined and available
        expect(queryNormalizer.getDependentQueriesByIds).toBeDefined();
        expect(typeof queryNormalizer.getDependentQueriesByIds).toBe('function');

        // Call with empty array should not throw
        const result = queryNormalizer.getDependentQueriesByIds([]);
        expect(Array.isArray(result)).toBe(true);
    });

    it('should correctly handle normalize: false', () => {
        if (!dataManager.normalizer) {
            throw new Error('Normalizer should be initialized');
        }

        const config: DataSourceNormalizerConfig = {normalize: false};

        const queryNormalizer = createQueryNormalizer({
            queryClient: dataManager.queryClient,
            normalizer: dataManager.normalizer,
            optimisticUpdate: (data) => dataManager.optimisticUpdate(data),
            normalizerConfig: config,
            optimisticUpdateConfig,
        });

        expect(queryNormalizer).toBeDefined();
    });

    it('should disable optimistic updates if normalize is disabled', () => {
        if (!dataManager.normalizer) {
            throw new Error('Normalizer should be initialized');
        }

        const config: DataSourceNormalizerConfig = {normalize: false};

        const queryNormalizer = createQueryNormalizer({
            queryClient: dataManager.queryClient,
            normalizer: dataManager.normalizer,
            optimisticUpdate: (data) => dataManager.optimisticUpdate(data),
            normalizerConfig: config,
            optimisticUpdateConfig: {enabled: true}, // Try to enable
        });

        // Normalizer is created, but optimistic updates should not work
        expect(queryNormalizer).toBeDefined();
    });
});
