import axiosClient from "../http/axiosclient";
import type { ApiResponse } from "./ApiResponse";
import type { MemoryStatus, ResetMemoryRequest, ResetMemoryResult } from "./MemoryStatus";

/** Live host-memory pressure plus the loaded model's valve telemetry. */
const getMemoryStatus = async (): Promise<ApiResponse<MemoryStatus>> => {
    const response = await axiosClient.get("/memory");
    return response.data;
};

/**
 * Re-arm the memory pressure valve. `relieveNow` (default true) also trims the
 * device/activation pools and runs a blocking compaction; pass false while a
 * job is training so the reset never stalls it.
 *
 * Failures (e.g. no model loaded) arrive inside an HTTP-200 envelope and are
 * toasted automatically by the axios interceptor.
 */
const resetMemory = async (req: ResetMemoryRequest = {}): Promise<ApiResponse<ResetMemoryResult>> => {
    const response = await axiosClient.post("/memory/reset", req);
    return response.data;
};

export default { getMemoryStatus, resetMemory };