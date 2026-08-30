import type { InteractionStatus } from "../stores/InteractionStatus";
import type { TrainingConfigEntry } from "./TrainingConfigEntry";


export type ConfigManagerTrainingConfigResponse = {
    message: string;
    status: InteractionStatus;
    trainingConfigs?: TrainingConfigEntry[];
    trainingConfig?: TrainingConfigEntry;
};


