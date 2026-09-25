export type TrainingFileRequest = {
    /** One or more corpus files, combined server-side into a single corpus. */
    textFiles: File[];
    transformerModelId: string;
    vocabularyId: string;
    /** Selected TrainingCheckpointEntry id, or null to start from scratch. */
    previousCheckpointId: string | null;
};
