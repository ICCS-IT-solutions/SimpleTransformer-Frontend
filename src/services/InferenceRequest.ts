import type { GenerationParameters } from './GenerationParameters';

export type InferenceRequest = {
    inputText: string;
    generationParameters: GenerationParameters;
};
