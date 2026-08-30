import type { InteractionStatus } from "../stores/InteractionStatus";
import type { TransformerConfigEntry } from "./TransformerConfigEntry";


export type ConfigManagerTransformerConfigResponse = {
    message: string;
    status: InteractionStatus;
    transformerConfigs?: TransformerConfigEntry[];
    transformerConfig?: TransformerConfigEntry;
};
