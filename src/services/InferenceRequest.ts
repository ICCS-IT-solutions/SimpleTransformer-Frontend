import type { GenerationParameters } from './GenerationParameters';

export type InferenceRequest = {
    inputText: string;
    transformerModelId: string;
    generationParameters: GenerationParameters;
};
