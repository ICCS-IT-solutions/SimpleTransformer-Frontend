import axiosClient from "../http/axiosclient";
import type { ApiResponse } from "./ApiResponse";
import type { ConfigManagerResponse } from "./ConfigManagerResponse";
import type { ConfigManagerTrainingConfigResponse } from "./ConfigManagerTrainingConfigResponse";
import type { ConfigManagerTransformerConfigResponse } from "./ConfigManagerTransformerConfigResponse";
import type { CreateTrainingConfigRequest } from "./CreateTrainingConfigRequest";
import type { CreateTransformerConfigRequest } from "./CreateTransformerConfigRequest";
import type { UpdateTrainingConfigRequest } from "./UpdateTrainingConfigRequest";
import type { UpdateTransformerConfigRequest } from "./UpdateTransformerConfigRequest";

const UpdateTransformerConfig = async (req: UpdateTransformerConfigRequest): Promise<ApiResponse<ConfigManagerResponse>> => {
    var response = await axiosClient.post('/config/update/transformer', req);
    return response.data;
}

const UpdateTrainingConfig = async (req: UpdateTrainingConfigRequest): Promise<ApiResponse<ConfigManagerResponse>> => {
    var response = await axiosClient.post('/config/update/training', req);
    return response.data;
}

const CreateTrainingConfig = async (req: CreateTrainingConfigRequest): Promise<ApiResponse<ConfigManagerTrainingConfigResponse>> => {
    var response = await axiosClient.post('/config/create/training', req);
    return response.data;
}

const CreateTransformerConfig = async (req: CreateTransformerConfigRequest): Promise<ApiResponse<ConfigManagerTransformerConfigResponse>> => {
    var response = await axiosClient.post('/config/create/transformer', req);
    return response.data;
}

const GetTrainingConfigs = async (): Promise<ApiResponse<ConfigManagerTrainingConfigResponse>> => {
    var response = await axiosClient.get('/config/training/list');
    return response.data;
}

const GetTransformerConfigs = async (): Promise<ApiResponse<ConfigManagerTransformerConfigResponse>> => {
    var response = await axiosClient.get('/config/transformer/list');
    return response.data;
}

//Get individual configs using their id's
const GetTrainingConfig = async (configId: string): Promise<ApiResponse<ConfigManagerTrainingConfigResponse>> => {
    var response = await axiosClient.get('/config/training/' + configId);
    return response.data;
}

const GetTransformerConfig = async (configId: string): Promise<ApiResponse<ConfigManagerTransformerConfigResponse>> => {
    var response = await axiosClient.get('/config/transformer/' + configId);
    return response.data;
}

export default { 
    UpdateTransformerConfig, 
    UpdateTrainingConfig, 
    CreateTrainingConfig, 
    CreateTransformerConfig,
    GetTrainingConfigs, 
    GetTransformerConfigs, 
    GetTrainingConfig, 
    GetTransformerConfig };