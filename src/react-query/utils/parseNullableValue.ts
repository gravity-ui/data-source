import {nullSymbol, undefinedSymbol} from '../constants';

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
