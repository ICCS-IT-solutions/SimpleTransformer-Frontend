export type TrainingRequest = {
    inputText: string;
    transformerModelId: string;
    vocabularyId: string;
    previousCheckpointId: string;
    previousCheckpoint: string;
};
