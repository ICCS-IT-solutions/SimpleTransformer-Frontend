import { defineStore } from "pinia";
import transformerModelService from "../services/transformerModelService";
import type { TransformerModelEntry } from "../services/TransformerModelEntry";
import type { CreateTransformerModelRequest } from "../services/CreateTransformerModelRequest";

//Note to self: Once I have a toast notification service, I can use it here to notify on error and failure responses.

type transformerModelStoreState = {
    model: TransformerModelEntry | null;
    models: TransformerModelEntry[];
}

const defaultState : transformerModelStoreState = {
    model: null,
    models: []
}

const transformerModelStore = defineStore('transformerModelStore', {
    state: () => defaultState,
    actions: {
        async getModels() {
            const response = await transformerModelService.getModels();

            if (response?.data?.models) {
                this.models = response.data.models;
            } else {
                this.models = [];
            }
        },

        async getModel(modelId: string) {
            const response = await transformerModelService.getModel(modelId);

            if (response?.data?.model) {
                this.model = response.data.model;
            } else {
                this.model = null;
            }
        },
        async createTransformerModel (req: CreateTransformerModelRequest) {
            await transformerModelService.createModel(req);
        },
        async updateTransformerModel (req: CreateTransformerModelRequest) {
            await transformerModelService.createModel(req);
        },
        async loadModel (modelId: string) {
            await transformerModelService.loadModel(modelId);
        }
    }
})

export default transformerModelStore;