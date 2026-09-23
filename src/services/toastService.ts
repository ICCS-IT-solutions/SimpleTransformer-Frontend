/**
 * Thin wrapper around bootstrap-vue-next's toast orchestrator.
 *
 * `useToast()` relies on Vue's `inject()`, so it can only be called from a
 * component's setup(). Axios interceptors run outside of any component, so
 * App.vue registers the toast creator here while its setup context is active
 * and everything else (services, interceptors) calls these helpers.
 */

export type ToastVariant = "success" | "danger" | "warning" | "info";

export type ToastPayload = {
    title: string;
    variant: ToastVariant;
    body?: string;
};

type ToastRegistrar = (payload: ToastPayload) => void;

/** How long a toast stays on screen before auto-hiding. */
export const TOAST_DURATION_MS = 5000;

let registrar: ToastRegistrar | null = null;

export const registerToastRegistrar = (fn: ToastRegistrar): void => {
    registrar = fn;
};

const show = ({ title, variant, body }: ToastPayload): void => {
    if (!registrar) {
        //Toasts are not wired up yet (or the app is running headless).
        console.warn(`[toast:${variant}] ${title}${body ? ` - ${body}` : ""}`);
        return;
    }

    registrar({ title, variant, body });
};

export const toastService = {
    success: (title: string, body?: string) => show({ title, variant: "success", body }),
    error: (title: string, body?: string) => show({ title, variant: "danger", body }),
    warning: (title: string, body?: string) => show({ title, variant: "warning", body }),
    info: (title: string, body?: string) => show({ title, variant: "info", body }),
};

export default toastService;
