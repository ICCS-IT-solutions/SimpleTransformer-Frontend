
export type TransformerModelEntry = {
    entryId: string;
    name: string;
    description: string;
    isLoaded: boolean; 
    transformerConfigId: string;
    trainingConfigId: string;
    accelerationBackend?: string;
    // True for a quantised LoRA model (frozen 4-bit base weights plus trainable
    // adapters), false for a raw model where every weight is a dense fp32
    // trainable parameter. Fixed at creation and ignored on update.
    useQLora?: boolean;
    dateCreated: Date;
    dateUpdated?: Date;
};
