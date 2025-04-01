import {nullSymbol, undefinedSymbol} from '../constants';

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
