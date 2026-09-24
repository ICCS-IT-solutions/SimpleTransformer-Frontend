import { defineStore } from 'pinia';
import type { InferenceRequest } from '../services/InferenceRequest';
import inferenceService from '../services/inferenceService';
import type { TransformerModelEntry } from '../services/TransformerModelEntry';
import transformerModelService from '../services/transformerModelService';
import type { TrainingCheckpointEntry } from '../services/TrainingCheckpointEntry';

type inferenceStoreState = {
    request: InferenceRequest,
    availableCheckpoints: TrainingCheckpointEntry[],
    availableModels: TransformerModelEntry[],
    outputText: string,
    selectedModelId: string,
};

const defaultState : inferenceStoreState = {
    request: {
        inputText: '',
        transformerModelId: '',
        trainingCheckpointId: '',
        generationParameters: {
            max_tokens: 100,
            temperature: 1,
            penalty: 0,
            top_p: 1,
            top_k: 50
        }
    },
    availableCheckpoints: [],
    availableModels: [],
    outputText: "",
    selectedModelId: ""
}

const inferenceStore = defineStore('inferenceStore', {
    state: () => defaultState,
    actions: {
        async predict (req: InferenceRequest) {
            this.request = req;
            var res = await inferenceService.predict(req);
            if (res.data) {
                this.outputText = res.data.outputText;
            }
        },
        async getModels() {
            var res = await transformerModelService.getModels();
            if (res.data) {
                this.availableModels = res.data.models ?? [];
            }
        },
        async getCheckpoints(modelId?: string) {
            const id = modelId || this.request.transformerModelId || this.selectedModelId;
            if (!id) {
                this.availableCheckpoints = [];
                return;
            }
            try {
                var res = await inferenceService.getCheckpoints(id);
                if (res.data) {
                    this.availableCheckpoints = res.data;
                } else {
                    this.availableCheckpoints = [];
                }
            } catch {
                this.availableCheckpoints = [];
            }
        },
        reset() {
            Object.assign(this, defaultState)
        }
    }
})
export default inferenceStore