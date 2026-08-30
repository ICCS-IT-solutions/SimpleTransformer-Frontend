import type { InteractionStatus } from "../stores/InteractionStatus";
import type { VocabularyEntry } from "./VocabularyEntry";

export type VocabularyLoaderResponse = {
    message: string;
    status: InteractionStatus;
};

export type AvailableVocabulariesResponse = {
    vocabularies: VocabularyEntry[],
    isLoaded: boolean
}

export type VocabularyUploadRequest = {
    files: File[],
    name?: string
}

