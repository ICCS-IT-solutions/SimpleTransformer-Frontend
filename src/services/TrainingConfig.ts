import type { OptimizerType } from "./OptimizerType";


export type TrainingConfig = {
    optimizer: OptimizerType;
    learningRate: number;
    batchSize: number;
    // Drop a trailing mini-batch that is smaller than batchSize, so every
    // optimizer step is based on a full batch. Ignored when the dataset is
    // smaller than one batch (the partial batch is kept so training still runs).
    dropLast?: boolean;
    epochs: number;
    dropoutRate: number;
    weightDecay: number;
    maxGradientNorm: number;
    beta1: number;
    beta2: number;
    epsilon: number;
    sgdMomentum: number;
    useNesterov: boolean;
    warmupSteps: number;
    minLearningRate: number;
};
