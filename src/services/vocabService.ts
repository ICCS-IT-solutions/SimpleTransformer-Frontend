import axiosClient from "../http/axiosclient";
import type { ApiResponse } from "./ApiResponse";
import type { CompileVocabularyRequest } from "./CompileVocabularyRequest";
import type { LoadVocabularyRequest } from "./LoadVocabularyRequest";
import type { VocabularyCompilationResponse } from "./VocabularyCompilationResponse";
import type { VocabularyLoaderResponse } from "./VocabularyLoaderResponse";
import type { VocabularyPropertiesResponse } from "./VocabularyPropertiesResponse";


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

export default { loadFile, compileFiles, getCurrentVocabSize };


