import type { LogEntry } from './LogEntry';

/**
 * Result of a log read. `truncated` means the source was larger than the read
 * window or the entry cap, so the list is partial - the view surfaces this
 * rather than implying the result is complete.
 */
export type LogSearchResult = {
    entries: LogEntry[];
    totalMatched: number;
    truncated: boolean;
};