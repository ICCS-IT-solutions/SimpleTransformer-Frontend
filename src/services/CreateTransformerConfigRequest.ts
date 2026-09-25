import type { TransformerConfig } from "./TransformerConfig";

export type CreateTransformerConfigRequest = {
    displayName?: string;
    name: string;
    description: string;
    config: TransformerConfig;
};

