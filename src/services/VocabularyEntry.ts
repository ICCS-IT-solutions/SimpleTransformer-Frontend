
export type VocabularyEntry = {
    entryId: string;
    name: string;
    // The API serialises this enum as a string ("WordLevel", "Bpe", "SentencePiece").
    tokenizerType: string;
    dateCreated: Date;
    numTokens: number;
    filename: string;
    filepath: string;
    /** Source files this was compiled from; empty for older entries. */
    sourceFileNames?: string;
    /** Size requested at compile time; 0 for older entries. */
    requestedSize?: number;
    /** Distinct types observed; 0 when the compiler reports no statistics. */
    typesSeen?: number;
    /** Fraction 0-1 of running tokens covered; 1.0 means not measured. */
    coverage?: number;
};

