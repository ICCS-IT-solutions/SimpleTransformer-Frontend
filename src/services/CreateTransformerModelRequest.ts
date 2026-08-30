import type { TrainingConfigEntry } from "./TrainingConfigEntry";
import type { TransformerConfigEntry } from "./TransformerConfigEntry";


export type CreateTransformerModelRequest = {
    name: string;
    description: string;
    transformerConfig: TransformerConfigEntry;
    trainingConfig: TrainingConfigEntry;
};
