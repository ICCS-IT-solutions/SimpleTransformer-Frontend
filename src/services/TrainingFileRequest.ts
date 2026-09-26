export type CorpusSourceFormat = 'auto' | 'txt' | 'json' | 'jsonl';

/** Optional extract + preprocess controls shared by file training and preview. */
export type CorpusPreprocessOptions = {
    format?: CorpusSourceFormat;
    textField?: string;
    template?: string;
    normalizeWhitespace?: boolean;
    stripHtml?: boolean;
    deduplicate?: boolean;
    minChars?: number;
    maxChars?: number;
};

export type TrainingFileRequest = {
    /** One or more corpus files, extracted + cleaned server-side into a single corpus. */
    textFiles: File[];
    /** Saved corpus id to train on instead of uploading files. Mutually exclusive with textFiles. */
    trainingCorpusId?: string | null;
    transformerModelId: string;
    vocabularyId: string;
    /** Selected TrainingCheckpointEntry id, or null to start from scratch. */
    previousCheckpointId: string | null;
} & CorpusPreprocessOptions;

export type CorpusPreviewRequest = {
    textFiles: File[];
} & CorpusPreprocessOptions;

export type TrainingCorpusEntry = {
    entryId: string;
    name: string;
    sourceFileNames: string;
    format: string;
    optionsJson: string;
    documentsIn: number;
    documentsOut: number;
    charsIn: number;
    charsOut: number;
    duplicatesRemoved: number;
    filteredByLength: number;
    filteredEmpty: number;
    fileSize: number;
    usedByJobs: number;
    dateCreated: string;
};

export type TrainingCorpusDetail = TrainingCorpusEntry & {
    optionsJson: string;
    options: Record<string, unknown> | null;
    warnings: string[];
};

export type CorpusCreateRequest = {
    name: string;
    textFiles: File[];
} & CorpusPreprocessOptions;

export type CorpusFileStats = {
    fileName: string;
    resolvedFormat: string;
    documentsIn: number;
    documentsOut: number;
};

export type CorpusSampleDoc = {
    fileName: string;
    original: string;
    cleaned: string;
};

export type CorpusPreprocessReport = {
    documentsIn: number;
    documentsOut: number;
    charsIn: number;
    charsOut: number;
    duplicatesRemoved: number;
    filteredByLength: number;
    filteredEmpty: number;
    files: CorpusFileStats[];
    warnings: string[];
    samples: CorpusSampleDoc[];
};
