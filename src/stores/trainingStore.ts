import { defineStore } from 'pinia';
import type { TrainingConfig } from '../services/TrainingConfig';
import type { TrainingFileRequest } from '../services/TrainingFileRequest';
import type { TrainingRequest } from '../services/TrainingRequest';
import trainingService from '../services/trainingService';
import configService from '../services/ConfigService';
import vocabService from '../services/vocabService';
import type { TrainingResponse } from '../services/TrainingResponse';
import type { ApiResponse } from '../services/ApiResponse';
import type { TrainingProgressResponse } from '../services/TrainingProgressResponse';
import type { ConfigManagerTrainingConfigResponse } from '../services/ConfigManagerTrainingConfigResponse';
import type { TransformerModelEntry } from '../services/TransformerModelEntry';
import transformerModelService from '../services/transformerModelService';
import type { VocabularyEntry } from '../services/VocabularyEntry';

type TrainingStoreState = {
    transformerModelId: string;
    vocabularyId: string;
    trainingResponse: ApiResponse<TrainingResponse> | null;
    
    currentJobs: ApiResponse<TrainingProgressResponse[]> | null;
    currentJob: ApiResponse<TrainingProgressResponse> | null;
    
    trainingFile: File | null;
    trainingInput: string;
    previousCheckpoint: string;

    trainingConfigResponse: ConfigManagerTrainingConfigResponse | null;

    trainingConfigOptions: TrainingConfig[] | null;
    availableModels: TransformerModelEntry[];
    availableVocabularies: VocabularyEntry[];
};

export const defaultAdamWTrainingConfig : TrainingConfig = {
    optimizer: 0,
    learningRate: 0.0003,
    batchSize: 0,
    epochs: 0,
    dropoutRate: 0,
    weightDecay: 0.01,
    maxGradientNorm: 1.0,
    beta1: 0.9,
    beta2: 0.999,
    epsilon: 1e-8,
    sgdMomentum: 0,
    useNesterov: false,
    warmupSteps: 0,
    minLearningRate: 0
}

export const defaultSgdTrainingConfig : TrainingConfig = {
    optimizer: 1,
    learningRate: 0.01,
    batchSize: 0,
    epochs: 0,
    dropoutRate: 0,
    weightDecay: 0.0001,
    maxGradientNorm: 1.0,
    beta1: 0.9,
    beta2: 0.999,
    epsilon: 1e-8,
    sgdMomentum: 0.9,
    useNesterov: true,
    warmupSteps: 0,
    minLearningRate: 0
}

const defaultState: TrainingStoreState = {
    transformerModelId: '',
    vocabularyId: '',
    trainingResponse: null,
    
    currentJobs: null,
    currentJob: null,

    trainingFile: null,
    trainingInput: '',
    previousCheckpoint: '',

    trainingConfigResponse: null,

    trainingConfigOptions: [
        defaultAdamWTrainingConfig,
        defaultSgdTrainingConfig,
    ],

    availableModels: [],
    availableVocabularies: [],
};

const trainingStore = defineStore('trainingStore', {
    state: () => defaultState,
    actions: {
        async trainFromFile(file: File, transformerModelId: string, vocabularyId: string, previousCheckpoint: string = "") {
            if(file === null) return;

            this.transformerModelId = transformerModelId;
            this.vocabularyId = vocabularyId;

            this.trainingFile = file;

            if (previousCheckpoint) this.previousCheckpoint = previousCheckpoint;
            
            const req : TrainingFileRequest = {
                textFile: this.trainingFile, 
                previousCheckpoint: this.previousCheckpoint,
                transformerModelId: this.transformerModelId,
                vocabularyId: this.vocabularyId,
                previousCheckpointId: ''
            };
            
            const response = await trainingService.trainFromFile(req);

            this.trainingResponse = response;
        },
        async trainFromLiveInput(input: string,  transformerModelId: string, vocabularyId: string,  previousCheckpoint: string = "") {
            if(input === '') return; //For now return on empty. Better yet would be to show a notification.

            this.transformerModelId = transformerModelId;
            this.vocabularyId = vocabularyId;

            if (previousCheckpoint) this.previousCheckpoint = previousCheckpoint;
            
            this.trainingInput = input;

            const req: TrainingRequest = {
                inputText: this.trainingInput, 
                previousCheckpoint: this.previousCheckpoint,
                transformerModelId: this.transformerModelId,
                vocabularyId: this.vocabularyId,
                previousCheckpointId: ''
            };

            const response = await trainingService.trainFromLiveInput(req);
            this.trainingResponse = response;
        },
        async getTrainingProgress (jobId: string) {
            const response = await trainingService.getTrainingProgress(jobId);
            this.currentJob = response;
        },
        async getTrainingJobs () {
            const response = await trainingService.getTrainingJobs();
            this.currentJobs = response;
        },
        async getTrainingConfigs() {
            const response = await configService.GetTrainingConfigs();
            this.trainingConfigResponse = response.data;
            return response.data;
        },
        async getModels() {
            var res = await transformerModelService.getModels();
            if (res.data) {
                this.availableModels = res.data.models ?? [];
            }
        },
        async getVocabularies() {
            var res = await vocabService.getAvailableVocabularies();
            if (res.data) {
                this.availableVocabularies = res.data.vocabularies ?? [];
            }
        }
    }
});

export default trainingStore
