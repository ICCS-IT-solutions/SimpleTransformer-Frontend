import type { TrainingConfig } from "./TrainingConfig";



export type TrainingConfigEntry = {
    entryId: string;
    name: string;
    description: string;
    config: TrainingConfig;
    dateCreated: Date;
};
