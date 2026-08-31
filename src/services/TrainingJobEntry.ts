import type { TrainingCheckpointEntry } from "./TrainingCheckpointEntry";
import type { TrainingJobStatus } from "./TrainingJobStatus";

export type TrainingJobEntry = {
    entryId: string;
    name: string;
    message: string;
    transformerConfigId: string;
    trainingConfigId: string;
    vocabularyId: string;
    inputText?: string;
    inputFilePath: string;
    previousCheckpointId?: string;
    dateCreated: Date;
    dateUpdated: Date;
    dateStarted?: Date;
    dateCompleted?: Date;
    status: TrainingJobStatus;
    currentEpoch: number;
    epochsCompleted: number;
    totalEpochs: number;
    currentBatch: number;
    batchesCompleted: number;
    totalBatches: number;
    currentSubBatch: number;
    subBatchesCompleted: number;
    totalSubBatches: number;
    currentLoss: number;
    trainingCheckpointId?: string;
    checkpointFilename: string;
    trainingCheckpoint?: TrainingCheckpointEntry;
    error: string;
};

