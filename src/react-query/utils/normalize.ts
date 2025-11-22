/** Checks if data should be normalized */
export const shouldNormalize = (
    providerConfig: boolean,
    queryConfig: boolean | undefined,
): boolean => {
    if (queryConfig !== undefined) {
        return queryConfig;
    }

    // Use setting from Provider
    return providerConfig;
};

/** Checks if data should be optimistically updated */
export const shouldUpdateOptimistically = (
    providerConfig: boolean,
    mutationConfig: boolean | undefined,
): boolean => {
    if (mutationConfig !== undefined) {
        return mutationConfig;
    }
    return providerConfig;
};
