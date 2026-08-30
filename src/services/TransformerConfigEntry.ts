import type { TransformerConfig } from "./TransformerConfig";



export type TransformerConfigEntry = {
    entryId: string;
    name: string;
    description: string;
    config: TransformerConfig;
    dateCreated: Date;
};
