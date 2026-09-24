import type { TrainingConfigEntry } from "./TrainingConfigEntry";
import type { TransformerConfigEntry } from "./TransformerConfigEntry";


export type CreateTransformerModelRequest = {
    name: string;
    description: string;
    transformerConfig: TransformerConfigEntry;
    trainingConfig: TrainingConfigEntry;
    // Acceleration backend name as returned by GET /backends ("Auto" selects automatically).
    accelerationBackend: string;
    // Training mode: true builds a QLoRA model, false builds a raw model. Only
    // honoured on create; the backend keeps the stored value on update.
    useQLora: boolean;
};
