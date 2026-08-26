import { defineStore } from "pinia";
import type { VocabularyLoaderResponse } from "../services/VocabularyLoaderResponse";
import type { VocabularyCompilationResponse } from "../services/VocabularyCompilationResponse";
import type { ApiResponse } from "../services/ApiResponse";
import type { LoadVocabularyRequest } from "../services/LoadVocabularyRequest";
import vocabService from "../services/vocabService";
import type { CompileVocabularyRequest } from "../services/CompileVocabularyRequest";
import type { VocabularyPropertiesResponse } from "../services/VocabularyPropertiesResponse";

type vocabStoreState = {
    vocabularyLoadResponse: ApiResponse<VocabularyLoaderResponse> | null,
    vocabularyCompileResponse: ApiResponse<VocabularyCompilationResponse> | null,
    vocabularyPropertiesResponse: ApiResponse<VocabularyPropertiesResponse> | null,

    filesToCompile: string[],
    fileToUpload: string,
}

const defaultState : vocabStoreState = {
    vocabularyLoadResponse: null,
    vocabularyCompileResponse: null,
    vocabularyPropertiesResponse: null,

    //For the frontend file upload and compilation
    filesToCompile: [],
    fileToUpload: ''
}

const vocabStore = defineStore('vocabStore', {
    state: () => defaultState,
    actions: {
        async UploadVocabFile (filename: string) {
            const req : LoadVocabularyRequest = {file: filename};
            this.vocabularyLoadResponse = await vocabService.loadFile(req);
        },
        async CompileVocabFiles (files: string[]) {
            const req : CompileVocabularyRequest = {files: files};
            this.vocabularyCompileResponse = await vocabService.compileFiles(req);
        },
        async GetVocabProperties () {
            this.vocabularyPropertiesResponse = await vocabService.getCurrentVocabSize();
        },
        reset() {
            Object.assign(this, defaultState)
        }
    }
});

export default vocabStore