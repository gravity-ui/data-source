export function makeSafeFetch<Args extends unknown[], FetchReturnType, CatchReturnType>(
    fetchFn: (...args: Args) => Promise<FetchReturnType>,
    onCatchFn: (reason: unknown) => CatchReturnType,
): (...args: Args) => Promise<FetchReturnType | CatchReturnType> {
    return (...args) => {
        return fetchFn(...args).catch(onCatchFn) as Promise<FetchReturnType | CatchReturnType>;
    };
}
