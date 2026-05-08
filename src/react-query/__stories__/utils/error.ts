export interface AppErrorProps {
    code?: string;
    title: string;
    description?: string;
    details?: unknown;
}

export class AppError extends Error implements AppErrorProps {
    static WELLKNOWN_CODES = {
        UNKNOWN: 'UNKNOWN',
    };

    code: string;
    title: string;
    description?: string;
    details?: unknown;

    constructor(propsOrMessage: AppErrorProps | string) {
        super(typeof propsOrMessage === 'string' ? propsOrMessage : propsOrMessage.title);

        this.name = 'AppError';

        if (typeof propsOrMessage === 'string') {
            this.code = AppError.WELLKNOWN_CODES.UNKNOWN;
            this.title = propsOrMessage;
        } else {
            this.code = propsOrMessage.code || AppError.WELLKNOWN_CODES.UNKNOWN;
            this.title = propsOrMessage.title;
            this.description = propsOrMessage.description;
            this.details = propsOrMessage.details;
        }

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }
}
