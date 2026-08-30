import axiosClient from "../http/axiosclient";
import type { ApiResponse } from "./ApiResponse";
import type { CompileVocabularyRequest } from "./CompileVocabularyRequest";
import type { LoadVocabularyRequest } from "./LoadVocabularyRequest";
import type { VocabularyCompilationResponse } from "./VocabularyCompilationResponse";
import type { AvailableVocabulariesResponse, VocabularyLoaderResponse, VocabularyUploadRequest } from "./VocabularyLoaderResponse";
import type { VocabularyPropertiesResponse } from "./VocabularyPropertiesResponse";
import type { VocabularySourceFile } from "./VocabularySourceFile";


const loadFile = async (req: LoadVocabularyRequest): Promise<ApiResponse<VocabularyLoaderResponse>> => {
    var response = await axiosClient.post('/vocabulary/file', req );
    return response.data;
}

const compileFiles = async (req: CompileVocabularyRequest): Promise<ApiResponse<VocabularyCompilationResponse>> => {
    var response = await axiosClient.post('/vocabulary/compile', req );
    return response.data;
}

const getCurrentVocabSize = async (): Promise<ApiResponse<VocabularyPropertiesResponse>> => {
    var response = await axiosClient.get('/vocabulary/properties');
    return response.data;
}

const uploadFiles = async (
    req: VocabularyUploadRequest
): Promise<ApiResponse<VocabularyLoaderResponse>> => {

    const formData = new FormData();

    for (const file of req.files) {
        formData.append("files", file);
    }

    const response = await axiosClient.post(
        "/vocabulary/upload",
        formData
    );

    return response.data;
};

const getVocabSources = async (): Promise<ApiResponse<VocabularySourceFile[]>> => {
    var response = await axiosClient.get('/vocabulary/sources');
    return response.data;
}
const getAvailableVocabularies = async (): Promise<ApiResponse<AvailableVocabulariesResponse>> => {
    var response = await axiosClient.get('/vocabulary/available');
    return response.data;
}

export default { loadFile, compileFiles, getCurrentVocabSize, uploadFiles, getVocabSources, getAvailableVocabularies };


