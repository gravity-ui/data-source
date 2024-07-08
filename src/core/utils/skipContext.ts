import type {AnyFunction} from '../types/utils';

export const skipContext = <TFunc extends AnyFunction>(fetch: TFunc) => {
    return (_0: unknown, _1: unknown, ...args: Parameters<TFunc>): ReturnType<TFunc> => {
        return fetch(...args);
    };
};
