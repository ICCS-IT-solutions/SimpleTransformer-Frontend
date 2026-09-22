import axiosClient from "../http/axiosclient";
import type { ApiResponse } from "./ApiResponse";
import type { AccelerationBackendInfo } from "./AccelerationBackendInfo";
import type { CreateTransformerModelRequest } from "./CreateTransformerModelRequest";
import type { TransformerModelResponse } from "./TransformerModelResponse";

const getBackends = async (): Promise<ApiResponse<AccelerationBackendInfo[]>> => {
    var response = await axiosClient.get('/backends');
    return response.data;
}

const getModel = async (modelId: string): Promise<ApiResponse<TransformerModelResponse>> => {
    var response = await axiosClient.get(`/models/${modelId}`);
    return response.data;
}

const getModels = async (): Promise<ApiResponse<TransformerModelResponse>> => {
    var response = await axiosClient.get('/models/list');
    return response.data;
}

const createModel = async (req: CreateTransformerModelRequest): Promise<ApiResponse<TransformerModelResponse>> => {
    var response = await axiosClient.post('/models/create', req);
    return response.data;
}

const updateModel = async (req: CreateTransformerModelRequest): Promise<ApiResponse<TransformerModelResponse>> => {
    var response = await axiosClient.post('/models/update', req);
    return response.data;
}

const loadModel = async (modelId: string) : Promise<ApiResponse<TransformerModelResponse>> => {
    var response = await axiosClient.post(`/models/${modelId}/load`);
    return response.data;
}

export default { getModel, createModel, getModels, updateModel, loadModel, getBackends };

