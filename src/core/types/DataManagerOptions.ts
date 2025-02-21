export interface InvalidateRepeatOptions {
    interval: number;
    /**
     * Number of repeated calls, not counting the first one
     */
    count: number;
}

export interface InvalidateOptions {
    repeat?: InvalidateRepeatOptions;
}
