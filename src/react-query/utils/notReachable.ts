export const notReachable = (value: never, message?: string): never => {
    throw new Error(message || `Not reachable state: ${value}`);
};
