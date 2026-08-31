
export type VocabularyEntry = {
    entryId: string;
    name: string;
    tokenizerType: TokenizerType;
    dateCreated: Date;
    numTokens: number;
    filename: string;
    filepath: string;
};

export enum TokenizerType {
    WordLevel,
    Bpe,
    SentencePiece
}

