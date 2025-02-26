const undefinedSymbol = Symbol('undefined');
const nullSymbol = Symbol('null');

export function parseNullableValue(value: any): any {
    if (value === undefinedSymbol) return undefined;
    if (value === nullSymbol) return null;

    return value;
}

export function formatNullableValue(value: any): any {
    if (value === undefined) return undefinedSymbol;
    if (value === null) return nullSymbol;

    return value;
}
