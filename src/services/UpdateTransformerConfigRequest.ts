import type { TransformerConfig } from "./TransformerConfig";


export type UpdateTransformerConfigRequest = {
    configId: string;
    name: string;
    description: string;
    config: TransformerConfig;
};
