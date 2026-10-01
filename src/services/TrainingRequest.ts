export type TrainingRequest = {
    inputText: string;
    transformerModelId: string;
    trainingConfigId: string;
    vocabularyId: string;
    /** Selected TrainingCheckpointEntry id, or null to start from scratch. */
    previousCheckpointId: string | null;
};
