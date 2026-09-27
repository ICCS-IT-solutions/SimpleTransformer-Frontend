import type { VocabularyEntry } from "./VocabularyEntry";

export type TransformerModelEntry = {
    entryId: string;
    name: string;
    description: string;
    isLoaded: boolean; 
    transformerConfigId: string;
    trainingConfigId: string;
    // Vocabulary this model tokenises with. Null until one is pinned (creation
    // with a choice, or the first training run). Fixed afterwards.
    vocabularyId?: string | null;
    // Flattened vocabulary row; only included by endpoints that include the
    // navigation (GET /models/{id} and GET /models/list).
    vocabulary?: VocabularyEntry | null;
    accelerationBackend?: string;
    // True for a quantised LoRA model (frozen 4-bit base weights plus trainable
    // adapters), false for a raw model where every weight is a dense fp32
    // trainable parameter. Fixed at creation and ignored on update.
    useQLora?: boolean;
    dateCreated: Date;
    dateUpdated?: Date;
};
