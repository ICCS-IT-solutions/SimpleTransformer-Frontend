import { defineStore } from 'pinia';
import type { FaultSummary } from '../services/FaultSummary';
import type { LogFileEntry } from '../services/LogFileEntry';
import type { LogEntry } from '../services/LogEntry';
import type { LogSearchResult } from '../services/LogSearchResult';
import faultService from '../services/faultService';
import logsService from '../services/logsService';

type LogsStoreState = {
    files: LogFileEntry[];
    entries: LogEntry[];
    faults: FaultSummary[];
    /** Which file is being read; empty means "all retained days". */
    selectedFile: string;
    search: string;
    level: string;
    lines: number;
    truncated: boolean;
    isLoading: boolean;
    isLoadingFaults: boolean;
    errorMessage: string;
};

const emptyResult = (): LogSearchResult => ({
    entries: [],
    totalMatched: 0,
    truncated: false,
});

const logsStore = defineStore('logsStore', {
    state: (): LogsStoreState => ({
        files: [],
        entries: [],
        faults: [],
        selectedFile: '',
        search: '',
        level: '',
        lines: 300,
        truncated: false,
        isLoading: false,
        isLoadingFaults: false,
        errorMessage: '',
    }),
    actions: {
        async getFiles() {
            this.errorMessage = '';
            const response = await logsService.getLogFiles();
            this.files = response.data ?? [];

            //Default to the newest file so the view opens on today rather than
            //an empty "all days" scan.
            if (!this.selectedFile && this.files.length > 0) {
                this.selectedFile = this.files[0].name;
            }
        },
        async getLogs() {
            this.isLoading = true;
            this.errorMessage = '';

            try {
                const params = {
                    file: this.selectedFile || undefined,
                    search: this.search.trim() || undefined,
                    level: this.level || undefined,
                    lines: this.lines,
                };
                const response = await logsService.getLogs(params);
                const result = response.data ?? emptyResult();

                this.entries = result.entries ?? [];
                this.truncated = result.truncated;

                if (!response.statusCode || response.statusCode >= 400) {
                    this.errorMessage = response.message;
                }
            } catch {
                //Axios already toasted unless silenced; the page shows its own
                //inline error rather than relying on a transient toast.
                this.errorMessage = 'Could not reach the backend for logs.';
                this.entries = [];
            } finally {
                this.isLoading = false;
            }
        },
        async getFaults() {
            this.isLoadingFaults = true;

            try {
                const response = await faultService.getFaults(100);
                this.faults = response.data ?? [];
            } catch {
                this.faults = [];
            } finally {
                this.isLoadingFaults = false;
            }
        },
        /** Clears the text/level filters and re-reads the current selection. */
        async resetFilters() {
            this.search = '';
            this.level = '';
            await this.getLogs();
        },
    },
});

export default logsStore;