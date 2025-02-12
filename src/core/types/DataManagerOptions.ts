export type RepeatOptions = {
    repeatInterval: number;
    /**
     * Number of repeated calls, not counting the first one
     */
    count: number;
};

export type InvalidateDataOptions = {
    repeat?: RepeatOptions;
};
