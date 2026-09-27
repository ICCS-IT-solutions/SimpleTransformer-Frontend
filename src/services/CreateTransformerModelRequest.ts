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
    // Vocabulary this model tokenises with. Pinned at creation and by the first
    // training run; null means "decide at first training" (the backend ignores
    // changes on update). Optional so older payloads still type-check.
    vocabularyId?: string | null;
};
