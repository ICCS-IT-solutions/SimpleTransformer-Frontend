import axiosClient from '../http/axiosclient';
import type { ApiResponse } from './ApiResponse';
import type { LogFileEntry } from './LogFileEntry';
import type { LogSearchResult } from './LogSearchResult';

/** Retained rolling log files, newest first. */
const getLogFiles = async (): Promise<ApiResponse<LogFileEntry[]>> => {
    const response = await axiosClient.get('/logs/files', { silent: true });
    return response.data;
};

/**
 * Tail of the log, newest entry last.
 *
 * Omitting `file` searches every retained day ("all days" mode), which is
 * slower and can come back truncated. `level` takes a Serilog token (ERR, WRN,
 * ...); `lines` is clamped server-side.
 *
 * `silent` because this is a polled read: the axios interceptor toasts on
 * failure, and a diagnostics page that cannot reach the backend would otherwise
 * stack one error toast per refresh.
 */
const getLogs = async (params: {
    file?: string;
    search?: string;
    level?: string;
    lines?: number;
} = {}): Promise<ApiResponse<LogSearchResult>> => {
    const response = await axiosClient.get('/logs', {
        params,
        silent: true,
    });
    return response.data;
};

export default { getLogFiles, getLogs };