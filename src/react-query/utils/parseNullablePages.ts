import type {InfiniteData} from '@tanstack/react-query';

import {parseNullableValue} from './parseNullableValue';

// `parseNullableValue` for the cached data of an infinite query: unwraps the nullable
// placeholders stored in every page. Returns the same object when no page needs unwrapping.
export const parseNullablePages = (data: unknown): unknown => {
    if (
        !data ||
        typeof data !== 'object' ||
        !Array.isArray((data as InfiniteData<unknown>).pages)
    ) {
        return data;
    }

    const {pages} = data as InfiniteData<unknown>;

    if (pages.every((page) => parseNullableValue(page) === page)) {
        return data;
    }

    return {...data, pages: pages.map(parseNullableValue)};
};
