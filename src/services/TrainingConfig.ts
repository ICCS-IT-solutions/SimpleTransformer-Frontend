import type { OptimizerType } from "./OptimizerType";


export type TrainingConfig = {
    optimizer: OptimizerType;
    learningRate: number;
    batchSize: number;
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
