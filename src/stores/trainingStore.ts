import { defineStore } from 'pinia';
import type { TrainingConfig } from '../services/TrainingConfig';
import type { TrainingFileRequest } from '../services/TrainingFileRequest';
import type { TrainingRequest } from '../services/TrainingRequest';
import trainingService from '../services/trainingService';
import type { TrainingResponse } from '../services/TrainingResponse';
import type { ApiResponse } from '../services/ApiResponse';
import type { TrainingProgressResponse } from '../services/TrainingProgressResponse';

type TrainingStoreState = {
    trainingConfig: string;
    trainingResponse: ApiResponse<TrainingResponse> | null;
    
    currentJobs: ApiResponse<TrainingProgressResponse[]> | null;
    currentJob: ApiResponse<TrainingProgressResponse> | null;
    
    trainingFile: File | null;
    trainingInput: string;
    previousCheckpoint: string;

    trainingConfigOptions: TrainingConfig[];
};

export const defaultAdamWTrainingConfig : TrainingConfig = {
    Optimizer: 0,
    LearningRate: 0.0003,
    BatchSize: 0,
    Epochs: 0,
    DropoutRate: 0,
    WeightDecay: 0.01,
    MaxGradientNorm: 1.0,
    Beta1: 0.9,
    Beta2: 0.999,
    Epsilon: 1e-8,
    SgdMomentum: 0,
    UseNesterov: false,
    WarmupSteps: 0,
    MinLearningRate: 0
}

export const defaultSgdTrainingConfig : TrainingConfig = {
    Optimizer: 1,
    LearningRate: 0.01,
    BatchSize: 0,
    Epochs: 0,
    DropoutRate: 0,
    WeightDecay: 0.0001,
    MaxGradientNorm: 1.0,
    Beta1: 0.9,
    Beta2: 0.999,
    Epsilon: 1e-8,
    SgdMomentum: 0.9,
    UseNesterov: true,
    WarmupSteps: 0,
    MinLearningRate: 0
}

const defaultState: TrainingStoreState = {
    trainingConfig: JSON.stringify(defaultAdamWTrainingConfig),
    trainingResponse: null,

    currentJobs: null,
    currentJob: null,

    trainingFile: null,
    trainingInput: '',
    previousCheckpoint: '',

    trainingConfigOptions: [
        defaultAdamWTrainingConfig,
        defaultSgdTrainingConfig
    ]
};

const trainingStore = defineStore('trainingStore', {
    state: () => defaultState,
    actions: {
        async trainFromFile(file: File, config: string, previousCheckpoint: string = "") {
            if(file === null) return;
            
            if (config) 
                this.trainingConfig = config;
            else 
                config = JSON.stringify(defaultAdamWTrainingConfig);

            this.trainingFile = file;

            if (previousCheckpoint) this.previousCheckpoint = previousCheckpoint;
            
            const req : TrainingFileRequest = {config: this.trainingConfig, textFile: this.trainingFile, previousCheckpoint: this.previousCheckpoint};
            
            const response = await trainingService.trainFromFile(req);

            this.trainingResponse = response;
        },
        async trainFromLiveInput(input: string, config: string, previousCheckpoint: string = "") {
            if(input === '') return; //For now return on empty. Better yet would be to show a notification.

            if (config)
                this.trainingConfig = config;
            else 
                config = JSON.stringify(defaultAdamWTrainingConfig);

            if (previousCheckpoint) this.previousCheckpoint = previousCheckpoint;
            
            this.trainingInput = input;

            const req: TrainingRequest = {config: this.trainingConfig, inputText: this.trainingInput, previousCheckpoint: this.previousCheckpoint};

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
        }
    }
});

export default trainingStore
