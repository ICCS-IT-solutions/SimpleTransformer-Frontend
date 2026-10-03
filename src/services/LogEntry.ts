/**
 * A parsed log entry from GET /logs.
 *
 * Continuations (e.g. the SQL body of an EF Core dump) are already folded into
 * `message` by the backend, so an entry may legitimately contain newlines.
 */
export type LogEntry = {
    /** Serilog default output format; empty for pre-rollover header lines. */
    timestamp: string;
    /** Three-letter level token: DBG, INF, WRN, ERR, FTL. */
    level: string;
    message: string;
};