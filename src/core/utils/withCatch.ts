/**
 * Creates a wrapper around a function that safely handles errors using a provided error handler.
 *
 * This utility function enhances a Promise-returning function by adding standardized error handling.
 * It catches any errors thrown by the original function and processes them through the provided
 * error handler, allowing for consistent error management across the application.
 *
 * @template TArgs - The argument types of the original function
 * @template TFetchReturnType - The return type of the original function's Promise
 * @template TCatchReturnType - The return type of the error handler function
 *
 * @param fetchFn - The original function that returns a Promise
 * @param onCatchFn - The error handler function that processes any caught errors
 *
 * @returns A new function with the same signature as the original function,
 *          but with error handling applied. The returned function will resolve to either
 *          the successful result of the original function or the result of the error handler.
 *
 * @example
 * // Basic usage with a string parameter
 * const fetchUser = withCatch(
 *   someFetchFunction,
 *   (error) => ({ error: true, message: error.message })
 * );
 */
export function withCatch<TArgs extends unknown[], TFetchReturnType, TCatchReturnType>(
    fetchFn: (...args: TArgs) => Promise<TFetchReturnType>,
    onCatchFn: (reason: unknown) => TCatchReturnType,
): (...args: TArgs) => Promise<WithCatchMergedReturn<TFetchReturnType, TCatchReturnType>> {
    return (...args) => {
        return fetchFn(...args).catch(onCatchFn) as Promise<
            WithCatchMergedReturn<TFetchReturnType, TCatchReturnType>
        >;
    };
}

/** If success is array-typed, an inferred `() => []` handler (`never[]`) is merged into the success type. */
type WithCatchMergedReturn<TSuccess, TCatch> = [TCatch] extends [never]
    ? TSuccess
    : [TSuccess] extends [readonly unknown[]]
      ? TCatch extends readonly never[]
          ? TSuccess
          : TSuccess | TCatch
      : TSuccess | TCatch;
