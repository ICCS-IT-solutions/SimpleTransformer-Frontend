/** Host-memory figures reported by GET /api/v1/memory (MemoryController). */
export type MemoryHostStatus = {
    privateBytes: number;
    /** Resident portion of privateBytes actually in physical RAM (Process.WorkingSet64). */
    workingSetBytes: number;
    managedHeapBytes: number;
    physicalBytes: number;
    quotaBytes: number;
    /** This process's share: privateBytes / physicalBytes. Distinct from the system figure below. */
    usedPercent: number;
    systemUsedPercent: number;
    availableMiB: number;
};

/** Envelope data for GET /api/v1/memory. */
export type MemoryStatus = {
    modelLoaded: boolean;
    modelId: string | null;
    isTraining: boolean;
    /** Valve telemetry line, e.g. "host 157 of 29424 MiB (proc 1%, sys 36% ...), 0 reliefs (last None)". */
    valve: string;
    host: MemoryHostStatus;
};

/** Body for POST /api/v1/memory/reset. */
export type ResetMemoryRequest = {
    /**
     * True (default) to also trim the pools and run a blocking compaction;
     * false to only clear the valve's latch and cooldown (never stalls a job).
     */
    relieveNow?: boolean;
};

/** Envelope data for POST /api/v1/memory/reset. */
export type ResetMemoryResult = {
    reset: boolean;
    relieveNow: boolean;
    /** Refreshed valve telemetry after the reset. Absent when no model was loaded. */
    valve?: string;
};