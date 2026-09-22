import type { InteractionStatus } from "../stores/InteractionStatus";
import type { TransformerModelEntry } from "./TransformerModelEntry";


export type TransformerModelResponse = {
    message: string;
    status: InteractionStatus;
    model?: TransformerModelEntry;
    models?: TransformerModelEntry[];
    // The backend actually resolved at runtime by the loaded model, e.g.
    // "GpuVulkan (AMD Radeon RX 5700 XT)". Only present on load/active responses.
    activeBackend?: string;
};
