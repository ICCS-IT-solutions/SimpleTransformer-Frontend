import type { InteractionStatus } from "../stores/InteractionStatus";
import type { Vocabulary } from "./Vocabulary";

export type VocabularyCompilationResponse = {
    message: string;
    status: InteractionStatus;
    vocabulary: Vocabulary;
    /** Size requested by the caller (the server default when omitted). */
    requestedVocabSize: number;
    /** Tokens actually produced; lower when the source has fewer types. */
    actualVocabSize: number;
    tokenizerType: string;
    /**
     * Distinct types observed in the source text. Only populated by
     * compilers that collect statistics (word level); 0 otherwise.
     */
    typesSeen: number;
    /**
     * Fraction (0-1) of running tokens covered by the kept vocabulary.
     * Always 1 when statistics were not collected.
     */
    coverage: number;
    /** First tokens by id: specials, then most frequent. */
    sampleTokens: string[];
};
