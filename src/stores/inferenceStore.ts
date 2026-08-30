import { defineStore } from 'pinia';
import type { InferenceRequest } from '../services/InferenceRequest';
import inferenceService from '../services/inferenceService';
import type { TransformerModelEntry } from '../services/TransformerModelEntry';
import transformerModelService from '../services/transformerModelService';

type inferenceStoreState = {
    request: InferenceRequest,
    availableModels: TransformerModelEntry[],
    outputText: string,
};

const defaultState : inferenceStoreState = {
    request: {
        inputText: '',
        transformerModelId: '',
        generationParameters: {
            max_tokens: 100,
            temperature: 1,
            penalty: 0,
            top_p: 1,
            top_k: 50
        }
    },
    availableModels: [],
    outputText: "",
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
        reset() {
            Object.assign(this, defaultState)
        }
    }
})
export default inferenceStore