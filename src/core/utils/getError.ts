export const getError = <T>(states: {error: T | null}[]) => {
    return states.find(({error}) => Boolean(error))?.error ?? null;
};
