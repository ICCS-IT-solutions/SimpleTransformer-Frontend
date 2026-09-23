export type TrainingCheckpointEntry = {
    entryId: string;
    filename: string;
    filepath: string;
    sha256?: string;
    fileSize: number;
    epoch: number;
    loss: number;
    dateCreated: string;
    trainingRunId?: string;
};
