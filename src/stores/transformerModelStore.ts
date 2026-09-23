import { defineStore } from "pinia";
import transformerModelService from "../services/transformerModelService";
import type { TransformerModelEntry } from "../services/TransformerModelEntry";
import type { CreateTransformerModelRequest } from "../services/CreateTransformerModelRequest";
import type { ApiResponse } from "../services/ApiResponse";
import type { TransformerModelResponse } from "../services/TransformerModelResponse";

//Note to self: Once I have a toast notification service, I can use it here to notify on error and failure responses.

type transformerModelStoreState = {
    model: TransformerModelEntry | null;
    models: TransformerModelEntry[];
    // The acceleration backend actually resolved at runtime by the active model
    // (from the load / active-model responses), e.g. "GpuVulkan (AMD Radeon RX 5700 XT)".
    activeBackend: string | null;
    loading_activeModel: boolean;
}

const defaultState : transformerModelStoreState = {
    model: null,
    models: [],
    activeBackend: null,
    loading_activeModel: false
}

const transformerModelStore = defineStore('transformerModelStore', {
    state: () => defaultState,
    actions: {
        async getModels(): Promise<ApiResponse<TransformerModelResponse>> {
            const response = await transformerModelService.getModels();

            if (response?.data?.models) {
                this.models = response.data.models;
            } else {
                this.models = [];
            }

            return response;
        },

        async getModel(modelId: string): Promise<ApiResponse<TransformerModelResponse>> {
            const response = await transformerModelService.getModel(modelId);

            if (response?.data?.model) {
                this.model = response.data.model;
            } else {
                this.model = null;
            }

            return response;
        },
        async createTransformerModel (req: CreateTransformerModelRequest): Promise<ApiResponse<TransformerModelResponse>> {
            const response = await transformerModelService.createModel(req);
            // Keep the list in sync with the backend response so all views stay reactive.
            if (response?.statusCode === 200) {
                await this.getModels();
            }
            return response;
        },
        async updateTransformerModel (modelId: string, req: CreateTransformerModelRequest): Promise<ApiResponse<TransformerModelResponse>> {
            const response = await transformerModelService.updateModel(modelId, req);
            if (response?.statusCode === 200) {
                await this.getModels();
            }
            return response;
        },
        async loadModel (modelId: string): Promise<ApiResponse<TransformerModelResponse>> {
            const response = await transformerModelService.loadModel(modelId);
            // The backend flips IsLoaded on this model and unloads any other, so
            // refetch the list on success to keep this store (and e.g. the Inference
            // view's "currently loaded" badge) in sync with the backend response.
            if (response?.statusCode === 200) {
                this.activeBackend = response.data?.activeBackend ?? null;
                await this.getModels();
            }
            return response;
        },
        async unloadModel (modelId: string): Promise<ApiResponse<TransformerModelResponse>> {
            const response = await transformerModelService.unloadModel(modelId);
            if (response?.statusCode === 200) {
                this.activeBackend = null;
                await this.getModels();
            }
            return response;
        },
        async getActiveModel (): Promise<ApiResponse<TransformerModelResponse>> {
            this.loading_activeModel = true;
            const response = await transformerModelService.getActiveModel();
            if (response?.statusCode === 200) {
                this.activeBackend = response.data?.activeBackend ?? null;
                this.model = response.data?.model ?? null;
                this.loading_activeModel = false;
            }
            return response;
        }
    }
})

export default transformerModelStore;