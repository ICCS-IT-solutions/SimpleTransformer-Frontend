import axiosClient from '../http/axiosclient';
import type { InferenceResponse } from '../stores/InferenceResponse';
import type { ApiResponse } from './ApiResponse';
import type { InferenceRequest } from './InferenceRequest';

const predict = async (req: InferenceRequest) :Promise<ApiResponse<InferenceResponse>> => {
    const response = await axiosClient.post('/predict', req );

    return response.data;
};

export default { predict }; 