/**
 * Tokenizer names understood by the compile endpoint. Sent as strings because
 * the backend binds them onto a string property before parsing the enum.
 */
export type VocabularyTokenizerType = "WordLevel" | "Bpe" | "SentencePiece";

/** Tokenizer options in the order they are offered in the UI. */
export const VOCABULARY_TOKENIZER_TYPES: VocabularyTokenizerType[] = [
    "WordLevel",
    "Bpe",
    "SentencePiece",
];

export const MIN_VOCAB_SIZE = 500;
export const MAX_VOCAB_SIZE = 100000;
/** Matches num_tokens_medium in config.ini, the backend's own default. */
export const DEFAULT_VOCAB_SIZE = 10000;

export type CompileVocabularyRequest = {
    files: string[];
    /**
     * Target vocabulary size including special tokens
     * (500-100000). Omit to use the configured server default.
     */
    vocabSize?: number;
    /** Omit to use the server's default tokenizer. */
    tokenizerType?: VocabularyTokenizerType;
    /** Custom entry name. Omit to let the backend generate a unique one. */
    name?: string;
};

