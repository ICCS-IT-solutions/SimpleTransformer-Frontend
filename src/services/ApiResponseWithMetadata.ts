import type { ApiResponse } from './ApiResponse';


export type ApiResponseWithMetadata<D, M> = ApiResponse<D> & {
    metadata: M;
};
