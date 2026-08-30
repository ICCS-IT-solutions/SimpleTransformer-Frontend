export type TrainingFileRequest = {
    textFile: File;
    transformerModelId: string;
    vocabularyId: string;
    previousCheckpointId: string;
    previousCheckpoint: string;
};
