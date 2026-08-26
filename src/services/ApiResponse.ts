import type { ResponseStatus } from './ResponseStatus';

export type ApiResponse<D> = {
    message: string;
    statusCode: number;
    status: ResponseStatus;
    data: D;
};
