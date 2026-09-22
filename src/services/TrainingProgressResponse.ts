import type { TrainingJobStatus } from "./TrainingJobStatus";


export type TrainingProgressResponse = {
    jobId: string;
    name: string;
    // The model this job targets, resolved server-side (name from the model table).
    transformerModelId: string;
    transformerModelName: string;
    status: TrainingJobStatus;
    currentEpoch: number;
    totalEpochs: number;
    currentBatch: number;
    totalBatches: number;
    numSubBatches: number;
    currentSubBatch: number;
    currentLoss: number;
    message: string;
    checkpoint?: string;
    startedAt: string;
    completedAt?: string;
    lastUpdatedAt: string;
    error?: string;
};

