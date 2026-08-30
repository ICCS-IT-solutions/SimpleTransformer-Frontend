import { defineStore } from 'pinia';
import configService from '../services/ConfigService';
import type { ConfigManagerTrainingConfigResponse } from '../services/ConfigManagerTrainingConfigResponse';
import type { ConfigManagerTransformerConfigResponse } from '../services/ConfigManagerTransformerConfigResponse';
import type { CreateTrainingConfigRequest } from '../services/CreateTrainingConfigRequest';
import type { CreateTransformerConfigRequest } from '../services/CreateTransformerConfigRequest';
import type { UpdateTransformerConfigRequest } from '../services/UpdateTransformerConfigRequest';
import type { UpdateTrainingConfigRequest } from '../services/UpdateTrainingConfigRequest';

type configStoreState = {
    //These carry the lists as well as the individual config entries
    trainingConfigResponse: ConfigManagerTrainingConfigResponse | null;
    transformerConfigResponse: ConfigManagerTransformerConfigResponse | null;
}

const defaultState: configStoreState = {
    trainingConfigResponse: null,
    transformerConfigResponse: null
}

const configStore = defineStore('config', {
    state: () => defaultState,
    actions: {
        async getTrainingConfigs() {
            const response = await configService.GetTrainingConfigs();
            this.trainingConfigResponse = response.data;
            return response.data;
        },
        async getTransformerConfigs() {
            const response = await configService.GetTransformerConfigs();
            this.transformerConfigResponse = response.data;
            return response.data;
        },
        async getTransformerConfig(configId: string) {
            const response = await configService.GetTransformerConfig(configId);
            this.transformerConfigResponse = response.data;
            return response.data;
        },
        async getTrainingConfig(configId: string) {
            const response = await configService.GetTrainingConfig(configId);
            this.trainingConfigResponse = response.data;
            return response.data;
        },
        async updateTrainingConfig(req: UpdateTrainingConfigRequest) {
            return await configService.UpdateTrainingConfig(req);
        },
        async updateTransformerConfig(req: UpdateTransformerConfigRequest) {
            return await configService.UpdateTransformerConfig(req);
        },
        async createTrainingConfig(req: CreateTrainingConfigRequest) {
           return await configService.CreateTrainingConfig(req);
        },
        async createTransformerConfig(req: CreateTransformerConfigRequest) {
            return await configService.CreateTransformerConfig(req);
        }
    }
});

export default configStore;