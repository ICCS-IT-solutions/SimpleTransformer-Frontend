import type { OptimizerType } from "./OptimizerType";


export type TrainingConfig = {
    Optimizer: OptimizerType;
    LearningRate: number;
    BatchSize: number;
    Epochs: number;
    DropoutRate: number;
    WeightDecay: number;
    MaxGradientNorm: number;
    Beta1: number;
    Beta2: number;
    Epsilon: number;
    SgdMomentum: number;
    UseNesterov: boolean;
    WarmupSteps: number;
    MinLearningRate: number;
};
