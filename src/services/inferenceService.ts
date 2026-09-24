import axiosClient from '../http/axiosclient';
import type { InferenceResponse } from '../stores/InferenceResponse';
import type { ApiResponse } from './ApiResponse';
import type { InferenceRequest } from './InferenceRequest';
import type { TrainingCheckpointEntry } from './TrainingCheckpointEntry';

const predict = async (req: InferenceRequest) :Promise<ApiResponse<InferenceResponse>> => {
    const response = await axiosClient.post('/predict', req );

    return response.data;
};

const getCheckpoints = async (transformerModelId:string) : Promise<ApiResponse<TrainingCheckpointEntry[]>> => {
    const response = await axiosClient.post(`/checkpoints/${transformerModelId}`);

    return response.data;
}

export default { predict, getCheckpoints }; 