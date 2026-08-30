import type { TrainingConfig } from "./TrainingConfig";


export type CreateTrainingConfigRequest = {
    name: string;
    description: string;
    config: TrainingConfig;
};


