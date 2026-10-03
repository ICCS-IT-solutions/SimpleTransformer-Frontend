/** One retained rolling log file, as listed by GET /logs/files. */
export type LogFileEntry = {
    /** e.g. "server-20261002.log". Passed back verbatim as the `file` param. */
    name: string;
    sizeBytes: number;
    lastModified: string;
};