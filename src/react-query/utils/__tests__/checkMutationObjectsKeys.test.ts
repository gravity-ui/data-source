import type {Data} from '@normy/core';
import {createNormalizer} from '@normy/core';

import {checkMutationObjectsKeys} from '../checkMutationObjectsKeys';

const createMockNormalizer = (objects: Record<string, Record<string, unknown>>) => {
    const normalizer = createNormalizer({});

    // Manually set normalized data for testing
    Object.keys(objects).forEach((key) => {
        const id = key.replace('@@', '');
        // Use object as-is, id is already included in objects[key]
        normalizer.setQuery(`test-${id}`, objects[key] as Data);
    });

    return normalizer;
};

describe('checkMutationObjectsKeys', () => {
    describe('when mutation data has no normalizable objects', () => {
        it('should return needsRefetch: false for primitive values', () => {
            const normalizer = createMockNormalizer({});

            const result = checkMutationObjectsKeys('string value', normalizer);

            expect(result).toEqual({
                needsRefetch: false,
                details: [],
            });
        });

        it('should return needsRefetch: false for null', () => {
            const normalizer = createMockNormalizer({});

            const result = checkMutationObjectsKeys(null, normalizer);

            expect(result).toEqual({
                needsRefetch: false,
                details: [],
            });
        });

        it('should return needsRefetch: false for empty array', () => {
            const normalizer = createMockNormalizer({});

            const result = checkMutationObjectsKeys([], normalizer);

            expect(result).toEqual({
                needsRefetch: false,
                details: [],
            });
        });

        it('should return needsRefetch: false for object without id', () => {
            const normalizer = createMockNormalizer({});

            const result = checkMutationObjectsKeys({name: 'test'}, normalizer);

            expect(result).toEqual({
                needsRefetch: false,
                details: [],
            });
        });
    });

    describe('when mutation object is not in normalized store', () => {
        it('should return needsRefetch: false for new object', () => {
            const normalizer = createMockNormalizer({});

            const result = checkMutationObjectsKeys({id: 'new-id', name: 'test'}, normalizer);

            expect(result).toEqual({
                needsRefetch: false,
                details: [],
            });
        });
    });

    describe('when mutation has same keys as normalized data', () => {
        it('should return needsRefetch: false for identical keys', () => {
            const normalizer = createMockNormalizer({
                '@@1': {id: '1', name: 'test', value: 100},
            });

            const result = checkMutationObjectsKeys(
                {id: '1', name: 'updated', value: 200},
                normalizer,
            );

            expect(result).toEqual({
                needsRefetch: false,
                details: [],
            });
        });

        it('should return needsRefetch: false when keys are same but in different order', () => {
            const normalizer = createMockNormalizer({
                '@@1': {id: '1', a: 1, b: 2, c: 3},
            });

            const result = checkMutationObjectsKeys({c: 30, a: 10, b: 20, id: '1'}, normalizer);

            expect(result).toEqual({
                needsRefetch: false,
                details: [],
            });
        });
    });

    describe('when mutation has fewer keys than normalized data', () => {
        it('should return needsRefetch: true with missing keys', () => {
            const normalizer = createMockNormalizer({
                '@@1': {id: '1', name: 'test', email: 'test@example.com', age: 25},
            });

            const result = checkMutationObjectsKeys({id: '1', name: 'updated'}, normalizer);

            expect(result.needsRefetch).toBe(true);
            expect(result.details).toHaveLength(1);
            expect(result.details[0].id).toBe('1');
            expect(result.details[0].missingKeys).toContain('email');
            expect(result.details[0].missingKeys).toContain('age');
        });

        it('should return needsRefetch: true when only id is present', () => {
            const normalizer = createMockNormalizer({
                '@@1': {id: '1', field1: 'a', field2: 'b', field3: 'c'},
            });

            const result = checkMutationObjectsKeys({id: '1'}, normalizer);

            expect(result.needsRefetch).toBe(true);
            expect(result.details[0].missingKeys).toEqual(
                expect.arrayContaining(['field1', 'field2', 'field3']),
            );
        });
    });

    describe('when mutation has different keys than normalized data', () => {
        it('should return needsRefetch: true when mutation has fewer keys even if some are different', () => {
            const normalizer = createMockNormalizer({
                '@@1': {id: '1', oldField: 'old', anotherField: 'value'},
            });

            // Mutation has fewer keys (2 vs 3), so needsRefetch should be true
            const result = checkMutationObjectsKeys({id: '1', newField: 'new'}, normalizer);

            expect(result.needsRefetch).toBe(true);
            expect(result.details[0].missingKeys).toContain('oldField');
            expect(result.details[0].missingKeys).toContain('anotherField');
        });
    });

    describe('with array of objects', () => {
        it('should check all objects in array', () => {
            const normalizer = createMockNormalizer({
                '@@1': {id: '1', name: 'first', extra: 'data'},
                '@@2': {id: '2', name: 'second', extra: 'data'},
            });

            const result = checkMutationObjectsKeys(
                [
                    {id: '1', name: 'updated'},
                    {id: '2', name: 'updated'},
                ],
                normalizer,
            );

            expect(result.needsRefetch).toBe(true);
            expect(result.details).toHaveLength(2);
            expect(result.details[0].id).toBe('1');
            expect(result.details[1].id).toBe('2');
        });

        it('should handle nested arrays', () => {
            const normalizer = createMockNormalizer({
                '@@1': {id: '1', field: 'a', extra: 'b'},
                '@@2': {id: '2', field: 'c', extra: 'd'},
            });

            const result = checkMutationObjectsKeys(
                [[{id: '1', field: 'updated'}], [{id: '2', field: 'updated'}]],
                normalizer,
            );

            expect(result.needsRefetch).toBe(true);
            expect(result.details).toHaveLength(2);
        });
    });

    describe('with custom getNormalizationObjectKey', () => {
        it('should use custom key function', () => {
            const normalizer = createNormalizer({
                getNormalizationObjectKey: (obj) =>
                    obj && typeof obj === 'object' && '_id' in obj
                        ? String((obj as {_id: unknown})._id)
                        : undefined,
            });

            // Set query with custom key
            normalizer.setQuery('test', {_id: 'custom-1', name: 'test', extra: 'field'});

            const result = checkMutationObjectsKeys(
                {_id: 'custom-1', name: 'updated'},
                normalizer,
                {
                    getNormalizationObjectKey: (obj) =>
                        '_id' in obj ? String(obj._id) : undefined,
                },
            );

            expect(result.needsRefetch).toBe(true);
            expect(result.details[0].id).toBe('custom-1');
        });
    });

    describe('edge cases', () => {
        it('should handle object with undefined id', () => {
            const normalizer = createMockNormalizer({});

            const result = checkMutationObjectsKeys({id: undefined, name: 'test'}, normalizer);

            expect(result).toEqual({
                needsRefetch: false,
                details: [],
            });
        });

        it('should handle object with numeric id', () => {
            const normalizer = createMockNormalizer({
                '@@123': {id: '123', value: 'test', extra: 'field'},
            });

            const result = checkMutationObjectsKeys({id: '123', value: 'updated'}, normalizer);

            expect(result.needsRefetch).toBe(true);
        });

        it('should handle large number of objects', () => {
            const objects: Record<string, Record<string, unknown>> = {};
            const mutationData: Array<{id: string; name: string}> = [];

            for (let i = 0; i < 100; i++) {
                objects[`@@${i}`] = {id: String(i), name: `item-${i}`, extra: 'field'};
                mutationData.push({id: String(i), name: `updated-${i}`});
            }

            const normalizer = createMockNormalizer(objects);

            const result = checkMutationObjectsKeys(mutationData, normalizer);

            expect(result.needsRefetch).toBe(true);
            expect(result.details).toHaveLength(100);
        });

        it('should handle empty object', () => {
            const normalizer = createMockNormalizer({});

            const result = checkMutationObjectsKeys({}, normalizer);

            expect(result).toEqual({
                needsRefetch: false,
                details: [],
            });
        });
    });
});
