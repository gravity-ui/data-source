export const undefinedSymbol = Symbol('undefined');
export const nullSymbol = Symbol('null');

export const formatNullableValue = <T>(
    value: T | undefined | null,
): T | typeof undefinedSymbol | typeof nullSymbol => {
    if (value === undefined) {
        return undefinedSymbol;
    }

    if (value === null) {
        return nullSymbol;
    }

    return value;
};

export const parseNullableValue = <T>(
    value: T | typeof undefinedSymbol | typeof nullSymbol,
): T | undefined | null => {
    if (value === undefinedSymbol) {
        return undefined;
    }

    if (value === nullSymbol) {
        return null;
    }

    return value;
};
