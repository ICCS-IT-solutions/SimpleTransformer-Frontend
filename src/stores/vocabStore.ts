import { defineStore } from "pinia";
import type { AvailableVocabulariesResponse, VocabularyLoaderResponse, VocabularyUploadRequest } from "../services/VocabularyLoaderResponse";
import type { VocabularyCompilationResponse } from "../services/VocabularyCompilationResponse";
import type { ApiResponse } from "../services/ApiResponse";
import vocabService from "../services/vocabService";
import type { CompileVocabularyRequest } from "../services/CompileVocabularyRequest";
import type { VocabularyPropertiesResponse } from "../services/VocabularyPropertiesResponse";
import type { VocabularySourceFile } from "../services/VocabularySourceFile";

type vocabStoreState = {
    vocabularyLoadResponse: ApiResponse<VocabularyLoaderResponse> | null,
    availableVocabulariesResponse: ApiResponse<AvailableVocabulariesResponse> | null,
    vocabularyCompileResponse: ApiResponse<VocabularyCompilationResponse> | null,
    vocabularyPropertiesResponse: ApiResponse<VocabularyPropertiesResponse> | null,

    filesToCompile: string[],
    filesToUpload: File[] | null,
    sourceFiles: ApiResponse<VocabularySourceFile[]> | null,
}

const defaultState : vocabStoreState = {
    vocabularyLoadResponse: null,
    availableVocabulariesResponse: null,
    vocabularyCompileResponse: null,
    vocabularyPropertiesResponse: null,

    //For the frontend file upload and compilation
    filesToCompile: [],
    filesToUpload: null,
    sourceFiles: null
}

const vocabStore = defineStore('vocabStore', {
    state: () => defaultState,
    actions: {
        async UploadVocabFile (files: File[]) {
            const req : VocabularyUploadRequest = {
                files: files
            };
            this.vocabularyLoadResponse = await vocabService.uploadFiles(req);
        },
        async CompileVocabFiles (files: string[]) {
            const req : CompileVocabularyRequest = {files: files};
            this.vocabularyCompileResponse = await vocabService.compileFiles(req);
        },
        async GetVocabProperties () {
            this.vocabularyPropertiesResponse = await vocabService.getCurrentVocabSize();
        },
        async GetVocabSources () {
            var response = await vocabService.getVocabSources();
            this.sourceFiles = response;
        },
        async GetVocabularies () {
            this.availableVocabulariesResponse = await vocabService.getAvailableVocabularies();
        },

        reset() {
            Object.assign(this, defaultState)
        }
    }
});

export default vocabStore