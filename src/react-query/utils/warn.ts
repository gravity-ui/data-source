export function warn(msg: string) {
    if (!msg || process.env.NODE_ENV === 'production') {
        return;
    }

    // eslint-disable-next-line no-console
    console.error(msg);
}
