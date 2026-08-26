import { defineStore } from 'pinia';
import type { InferenceRequest } from '../services/InferenceRequest';
import inferenceService from '../services/inferenceService';

type inferenceStoreState = {
    request: InferenceRequest,
    outputText: string,
};

const defaultState : inferenceStoreState = {
    request: {
        inputText: '',
        generationParameters: {
            max_tokens: 100,
            temperature: 1,
            penalty: 0,
            top_p: 1,
            top_k: 50
        }
    },
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
        reset() {
            Object.assign(this, defaultState)
        }
    }
})
export default inferenceStore