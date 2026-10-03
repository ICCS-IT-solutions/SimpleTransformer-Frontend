import axiosClient from '../http/axiosclient';
import type { ApiResponse } from './ApiResponse';
import type { FaultSummary } from './FaultSummary';

/** Recent fault signatures, newest first. Read-only: faults are recorded server-side. */
const getFaults = async (
    take = 100,
    component?: string
): Promise<ApiResponse<FaultSummary[]>> => {
    const response = await axiosClient.get('/faults', {
        params: { take, component: component || undefined },
        silent: true,
    });
    return response.data;
};

export default { getFaults };