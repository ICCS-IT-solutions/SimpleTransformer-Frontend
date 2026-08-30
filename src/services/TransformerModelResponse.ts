import type { InteractionStatus } from "../stores/InteractionStatus";
import type { TransformerModelEntry } from "./TransformerModelEntry";


export type TransformerModelResponse = {
    message: string;
    status: InteractionStatus;
    model?: TransformerModelEntry;
    models?: TransformerModelEntry[];
};
