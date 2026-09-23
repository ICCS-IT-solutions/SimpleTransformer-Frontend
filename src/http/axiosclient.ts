import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { toastService } from "../services/toastService";
import { ResponseStatus } from "../services/ResponseStatus";

declare module "axios" {
    export interface AxiosRequestConfig {
        /** Suppress the automatic toast for this request (success and error). */
        silent?: boolean;
        /** Suppress only the automatic success toast for this request. */
        silentSuccess?: boolean;
    }
}

const axiosClient = axios.create({
    baseURL: "http://localhost:5000/api/v1",
});

type ApiEnvelope = {
    message?: string;
    status?: number | string;
    statusCode?: number;
};

//The backend answers most failures with HTTP 200 and a status enum inside the
//ApiResponse envelope, so both the envelope and transport errors are inspected.
const asEnvelope = (value: unknown): ApiEnvelope | null => {
    if (typeof value !== "object" || value === null) return null;

    const record = value as Record<string, unknown>;
    return "status" in record || "statusCode" in record ? (record as ApiEnvelope) : null;
};

const isSuccessStatus = (status: number | string | undefined): boolean => {
    if (status === undefined) return true;

    //Handles both the numeric enum (0) and a future string enum ("Success").
    return status === ResponseStatus.Success || status === ResponseStatus[ResponseStatus.Success];
};

const isReadRequest = (method?: string): boolean => {
    const verb = (method ?? "get").toLowerCase();
    return verb === "get" || verb === "head" || verb === "options";
};

//Training jobs are polled every few seconds, so an outage must not stack up an
//endless column of identical error toasts.
const ERROR_THROTTLE_MS = 5000;
let lastErrorMessage = "";
let lastErrorAt = 0;

const showError = (message: string): void => {
    const now = Date.now();

    if (message === lastErrorMessage && now - lastErrorAt < ERROR_THROTTLE_MS) return;

    lastErrorMessage = message;
    lastErrorAt = now;

    toastService.error("Request failed", message);
};

const envelopeMessage = (envelope: ApiEnvelope | null): string | undefined => {
    const message = envelope?.message;
    return typeof message === "string" && message.length > 0 ? message : undefined;
};

axiosClient.interceptors.response.use(
    (response: AxiosResponse) => {
        const config = response.config;
        if (config.silent) return response;

        const envelope = asEnvelope(response.data);
        if (envelope === null) return response;

        //Failure delivered inside an HTTP 200 envelope.
        if (!isSuccessStatus(envelope.status) ||
            (typeof envelope.statusCode === "number" && envelope.statusCode >= 400)) {
            showError(envelopeMessage(envelope) ?? "The request was not successful.");
            return response;
        }

        //Reads are polled, so only user-initiated writes get a success toast.
        if (!config.silentSuccess && !isReadRequest(config.method)) {
            const message = envelopeMessage(envelope);
            if (message) toastService.success(message);
        }

        return response;
    },
    (error: AxiosError) => {
        const config = error.config as AxiosRequestConfig | undefined;
        if (!config?.silent) {
            const message = envelopeMessage(asEnvelope(error.response?.data)) ??
                error.message ??
                "Unable to reach the backend.";

            showError(message);
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
