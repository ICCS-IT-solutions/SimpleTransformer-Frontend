import type { TrainingConfig } from "./TrainingConfig";


export type UpdateTrainingConfigRequest = {
    configId: string;
    name: string;
    description: string;
    config: TrainingConfig;
};
