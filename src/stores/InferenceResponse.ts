import type { InteractionStatus } from './InteractionStatus';


export type InferenceResponse = {
    outputText: string;
    interactionStatus: InteractionStatus;
};
