import type {AnyFunction} from '../types/utils';

/**
 * @description
 *
 * The function is intended to be used with the `fetch` parameter of the query data source config.
 * It is used to ignore the query data context and the query function context parameters.
 *
 * NOTE: When passed directly to the `fetch` parameter, typescript fails to infer the types of the `DataSource` fields.
 * It is better to define a constant first.
 *
 * @example
 *
 * function someFetchFunction(request: TRequest) {...}
 *
 * const fetchData = skipContext(someFetchFunction);
 *
 * const dataSource = makePlainQueryDataSource({
 *   ...
 *   fetch: fetchData,
 *   ...
 * })
 *
 * @param fetch fetch function
 * @returns fetch function with the ignored query data source context and the query function context.
 */
export const skipContext = <TFunc extends AnyFunction>(fetch: TFunc) => {
    return (_0: unknown, _1: unknown, ...args: Parameters<TFunc>): ReturnType<TFunc> => {
        return fetch(...args);
    };
};
