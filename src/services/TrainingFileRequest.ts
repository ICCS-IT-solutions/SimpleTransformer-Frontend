export type TrainingFileRequest = {
    textFile: File;
    transformerModelId: string;
    vocabularyId: string;
    /** Selected TrainingCheckpointEntry id, or null to start from scratch. */
    previousCheckpointId: string | null;
};
