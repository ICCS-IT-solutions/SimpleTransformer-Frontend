/**
 * One fault signature from GET /faults. Occurrences are rolled up onto a single
 * row per signature (type + top stack frames), so `occurrenceCount` is how many
 * times this failure shape has happened since `firstSeenAt`.
 */
export type FaultSummary = {
    entryId: string;
    faultType: string;
    /** "training" | "inference" | "server". */
    component: string;
    message: string;
    jobId: string | null;
    modelId: string | null;
    occurrenceCount: number;
    firstSeenAt: string;
    lastSeenAt: string;
};