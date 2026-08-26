import type { InteractionStatus } from "../stores/InteractionStatus";
import type { Vocabulary } from "./Vocabulary";

export type VocabularyCompilationResponse = {
    message: string;
    status: InteractionStatus;
    vocabulary: Vocabulary;
};
