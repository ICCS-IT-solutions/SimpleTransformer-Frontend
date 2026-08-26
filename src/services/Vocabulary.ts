export type Vocabulary = {
    tokenToId: Map<string, number>;
    idToToken: Map<number, string>;
    //Compute this from the length of the tokenToId map
    count: number;
};
