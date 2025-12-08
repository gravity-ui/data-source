import {getId} from '@normy/core';

import type {Normalizer} from '../../core';

type DataObject = Record<string, unknown>;
type NormalizableObject = DataObject & {id?: string};

export interface AffectedObject {
    id: string;
    missingKeys: string[];
}

export interface MutationObjectsKeysResult {
    needsRefetch: boolean;
    details: AffectedObject[];
}

const hasFewerKeys = (mutation: DataObject, existing: DataObject): boolean => {
    const mutationKeys = Object.keys(mutation);
    const existingKeys = Object.keys(existing);

    if (mutationKeys.length >= existingKeys.length) {
        return false;
    }

    for (const key of mutationKeys) {
        if (!existingKeys.includes(key)) {
            return true;
        }
    }

    return true;
};

const extractNormalizableObjects = (
    data: unknown,
    getNormalizationObjectKey: (obj: NormalizableObject) => string | undefined,
): NormalizableObject[] => {
    const objects: NormalizableObject[] = [];

    function extract(item: unknown): void {
        if (Array.isArray(item)) {
            item.forEach(extract);
        } else if (item !== null && typeof item === 'object' && !(item instanceof Date)) {
            const obj = item as NormalizableObject;

            if (getNormalizationObjectKey(obj)) {
                objects.push(obj);
            }
        }
    }

    extract(data);

    return objects;
};

export const checkMutationObjectsKeys = (
    mutationData: unknown,
    normalizer: Normalizer,
    config?: {getNormalizationObjectKey?: (obj: NormalizableObject) => string | undefined},
): MutationObjectsKeysResult => {
    const getNormalizationObjectKey =
        config?.getNormalizationObjectKey || ((obj: NormalizableObject) => obj.id);

    const normalizedState = normalizer.getNormalizedData();

    const mutationObjects = extractNormalizableObjects(mutationData, getNormalizationObjectKey);

    if (mutationObjects.length === 0) {
        return {
            needsRefetch: false,
            details: [],
        };
    }

    const details: AffectedObject[] = [];

    for (const obj of mutationObjects) {
        const objectKey = getNormalizationObjectKey(obj);

        if (!objectKey) {
            continue;
        }

        const normalizedKey = getId(objectKey);

        const existingObject = normalizedState.objects[normalizedKey] as DataObject | undefined;

        if (existingObject && hasFewerKeys(obj, existingObject)) {
            const mutationKeys = Object.keys(obj);
            const existingKeys = Object.keys(existingObject);

            details.push({
                id: objectKey,
                missingKeys: existingKeys.filter((k) => !mutationKeys.includes(k)),
            });
        }
    }

    return {
        needsRefetch: details.length > 0,
        details,
    };
};
