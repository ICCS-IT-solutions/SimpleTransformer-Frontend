import { defineStore } from 'pinia';
import type { ApiResponse } from '../services/ApiResponse';
import type { CorpusCreateRequest, CorpusPreprocessReport, TrainingCorpusEntry } from '../services/TrainingFileRequest';
import trainingService from '../services/trainingService';

type CorpusStoreState = {
    corpora: TrainingCorpusEntry[];
    isLoading: boolean;
    isSaving: boolean;
    corpusPreview: ApiResponse<CorpusPreprocessReport> | null;
    isPreviewing: boolean;
};

const corpusStore = defineStore('corpusStore', {
    state: (): CorpusStoreState => ({
        corpora: [],
        isLoading: false,
        isSaving: false,
        corpusPreview: null,
        isPreviewing: false,
    }),
    actions: {
        async getCorpora() {
            this.isLoading = true;
            try {
                const response = await trainingService.getAvailableCorpora();
                this.corpora = response.data ?? [];
            } finally {
                this.isLoading = false;
            }
        },
        async previewCorpus(files: File[], options: Omit<CorpusCreateRequest, 'name' | 'textFiles'>) {
            if (!files || files.length === 0) return;

            this.isPreviewing = true;
            this.corpusPreview = null;

            try {
                this.corpusPreview = await trainingService.previewCorpus({
                    textFiles: files,
                    ...options,
                });
            } finally {
                this.isPreviewing = false;
            }
        },
        async createCorpus(req: CorpusCreateRequest) {
            this.isSaving = true;
            try {
                const response = await trainingService.createCorpus(req);
                await this.getCorpora();
                return response;
            } finally {
                this.isSaving = false;
            }
        },
        async deleteCorpus(corpusId: string) {
            await trainingService.deleteCorpus(corpusId);
            await this.getCorpora();
        },
    }
});

export default corpusStore;