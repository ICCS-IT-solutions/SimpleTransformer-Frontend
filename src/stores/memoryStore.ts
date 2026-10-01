import { defineStore } from 'pinia';
import memoryService from '../services/memoryService';
import type { ApiResponse } from '../services/ApiResponse';
import type { MemoryStatus, ResetMemoryResult } from '../services/MemoryStatus';

type MemoryStoreState = {
    /** Last GET /memory envelope, or null before the first fetch. */
    status: ApiResponse<MemoryStatus> | null;
    /** True while a reset is in flight, so every entry point can disable together. */
    resetting: boolean;
};

const defaultState: MemoryStoreState = {
    status: null,
    resetting: false,
};

const memoryStore = defineStore('memory', {
    state: () => ({ ...defaultState }),
    actions: {
        async fetchStatus() {
            this.status = await memoryService.getMemoryStatus();
            return this.status;
        },
        /**
         * Manual valve reset from any UI entry point (navbar dropdown, OOM
         * banner). Returns null when a reset is already in flight so double
         * clicks cannot stack a second blocking compaction.
         */
        async resetMemory(relieveNow = true): Promise<ApiResponse<ResetMemoryResult> | null> {
            if (this.resetting) return null;

            this.resetting = true;
            try {
                const response = await memoryService.resetMemory({ relieveNow });
                await this.fetchStatus();
                return response;
            } finally {
                this.resetting = false;
            }
        },
    },
});

export default memoryStore;