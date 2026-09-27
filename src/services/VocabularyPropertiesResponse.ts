
/**
 * One database vocabulary row flattened for display (mirrors the backend's
 * VocabularyEntryInfo; no navigation objects).
 */
export type VocabularyEntryInfo = {
    entryId: string;
    name: string;
    /** Tokenizer algorithm name ("WordLevel", "Bpe", "SentencePiece"). */
    tokenizerType: string;
    dateCreated: Date;
    numTokens: number;
    filename: string;
    filepath: string;
    /** Source files compiled from; empty for entries predating this field. */
    sourceFileNames: string;
    /** Size requested at compile time; 0 when unknown. */
    requestedSize: number;
    /** Distinct types observed; 0 when the compiler reports no statistics. */
    typesSeen: number;
    /** Fraction 0-1 of running tokens covered; 1.0 means not measured. */
    coverage: number;
};

export type VocabularyPropertiesResponse = {
    vocabSize: number;
    unknownToken: string;
    paddingToken: string;
    bosToken: string;
    eosToken: string;
    maskToken: string;

    // Populated by GET /vocabulary/properties/{modelId} and GET /vocabulary/active.
    tokenizerType?: string;
    tokenizerSource?: string;
    modelId?: string | null;
    modelName?: string | null;
    /** VocabSize the model's persisted transformer config expects. */
    modelVocabSize?: number | null;
    /** Database row of the vocabulary the model is pinned to. */
    vocabulary?: VocabularyEntryInfo | null;
    vocabularyPath?: string;
    vocabularyFileExists?: boolean;
    /** Token count read from the artifact file (source of truth). */
    vocabularyFileTokenCount?: number | null;
    /** True only when the pinned artifact is exactly the loaded token-to-id map. */
    liveVocabularyMatchesModel?: boolean;
    /** Everything found to be inconsistent; empty when it all lines up. */
    issues?: string[];
    isConsistent?: boolean;
};
