import type { GenerationParameters } from './GenerationParameters';

export type InferenceRequest = {
    inputText: string;
    transformerModelId: string;
    trainingCheckpointId?: string | null;
    generationParameters: GenerationParameters;
};
