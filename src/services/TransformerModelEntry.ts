
export type TransformerModelEntry = {
    entryId: string;
    name: string;
    description: string;
    isLoaded: boolean; 
    transformerConfigId: string;
    trainingConfigId: string;
    accelerationBackend?: string;
    dateCreated: Date;
    dateUpdated?: Date;
};
