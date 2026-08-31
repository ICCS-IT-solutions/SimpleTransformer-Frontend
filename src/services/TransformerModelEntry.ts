
export type TransformerModelEntry = {
    entryId: string;
    name: string;
    description: string;
    isLoaded: boolean; 
    transformerConfigId: string;
    trainingConfigId: string;
    dateCreated: Date;
    dateUpdated?: Date;
};
