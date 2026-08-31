
export type TrainingCheckpointEntry = {
    entryId: string;
    filename: string;
    filepath: string;
    sha256?: string;
    filesize: number;
    epoch: number;
    loss: number;
    dateCreated: Date;
    trainingRunId?: string;
};
