import type { TransformerConfig } from "./TransformerConfig";


export type CreateTransformerConfigRequest = {
    name: string;
    description: string;
    config: TransformerConfig;
};

