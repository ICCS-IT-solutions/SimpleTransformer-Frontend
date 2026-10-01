import { defineStore } from "pinia";
import type { AvailableVocabulariesResponse, VocabularyLoaderResponse, VocabularyUploadRequest } from "../services/VocabularyLoaderResponse";
import type { VocabularyCompilationResponse } from "../services/VocabularyCompilationResponse";
import type { ApiResponse } from "../services/ApiResponse";
import vocabService from "../services/vocabService";
import type { CompileVocabularyRequest } from "../services/CompileVocabularyRequest";
import type { VocabularyPropertiesResponse } from "../services/VocabularyPropertiesResponse";
import type { VocabularySourceFile } from "../services/VocabularySourceFile";
import { ResponseStatus } from "../services/ResponseStatus";

type vocabStoreState = {
    vocabularyLoadResponse: ApiResponse<VocabularyLoaderResponse> | null,
    availableVocabulariesResponse: ApiResponse<AvailableVocabulariesResponse> | null,
    vocabularyCompileResponse: ApiResponse<VocabularyCompilationResponse> | null,
    vocabularyCompileError: string,
    vocabularyPropertiesResponse: ApiResponse<VocabularyPropertiesResponse> | null,
    // Vocabulary details for a model: live vocabulary + pinned row + mismatches.
    activeVocabularyResponse: ApiResponse<VocabularyPropertiesResponse> | null,

    filesToCompile: string[],
    filesToUpload: File[] | null,
    sourceFiles: ApiResponse<VocabularySourceFile[]> | null,
}

const defaultState : vocabStoreState = {
    vocabularyLoadResponse: null,
    availableVocabulariesResponse: null,
    vocabularyCompileResponse: null,
    vocabularyCompileError: "",
    vocabularyPropertiesResponse: null,
    activeVocabularyResponse: null,

    //For the frontend file upload and compilation
    filesToCompile: [],
    filesToUpload: null,
    sourceFiles: null
}

/**
 * Pulls the most useful message out of an axios failure: the ApiResponse
 * envelope's message first, then the transport error, then a fallback.
 */
const resolveErrorMessage = (error: unknown): string => {
    const envelopeMessage = (error as { response?: { data?: { message?: unknown } } })
        ?.response?.data?.message;

    if (typeof envelopeMessage === "string" && envelopeMessage.length > 0) {
        return envelopeMessage;
    }

    if (error instanceof Error && error.message.length > 0) {
        return error.message;
    }

    return "Vocabulary compilation failed.";
};

const vocabStore = defineStore('vocabStore', {
    state: () => defaultState,
    actions: {
        async UploadVocabFile (files: File[]) {
            const req : VocabularyUploadRequest = {
                files: files
            };
            this.vocabularyLoadResponse = await vocabService.uploadFiles(req);
        },
        async CompileVocabFiles (req: CompileVocabularyRequest) {
            this.vocabularyCompileError = "";
            this.vocabularyCompileResponse = null;

            try {
                const response = await vocabService.compileFiles(req);

                //The backend reports failures inside an HTTP 200 envelope, so the
                //envelope has to be inspected before the payload is treated as a
                //successful compilation.
                if (
                    response.statusCode >= 400 ||
                    response.status !== ResponseStatus.Success
                ) {
                    this.vocabularyCompileError =
                        response.message || "Vocabulary compilation failed.";
                    return;
                }

                this.vocabularyCompileResponse = response;
            } catch (error) {
                //The axios interceptor toasts transport failures; keep the message
                //so the view can show it inline as well.
                this.vocabularyCompileError = resolveErrorMessage(error);
            }
        },
        async GetVocabProperties () {
            this.vocabularyPropertiesResponse = await vocabService.getCurrentVocabSize();
        },
        /**
         * Loads the vocabulary details for the loaded model (pass a model id for a
         * specific one): the live vocabulary, the pinned database row and every
         * mismatch between config, artifact and the live token-to-id map.
         */
        async GetActiveVocabulary (modelId?: string) {
            const response = modelId
                ? await vocabService.getModelVocabulary(modelId)
                : await vocabService.getActiveVocabulary();

            this.activeVocabularyResponse = response;
            return response;
        },
        async GetVocabSources () {
            var response = await vocabService.getVocabSources();
            this.sourceFiles = response;
        },
        async GetVocabularies () {
            this.availableVocabulariesResponse = await vocabService.getAvailableVocabularies();
        },
        async DeleteVocabulary (vocabularyName: string) {
            const response = await vocabService.deleteVocabulary(vocabularyName);

            //The backend reports failures inside an HTTP 200 envelope, so the
            //list is only refreshed when the delete actually succeeded.
            if (
                response.statusCode >= 400 ||
                response.status !== ResponseStatus.Success
            ) {
                return response;
            }

            await this.GetVocabularies();
            return response;
        },

        reset() {
            Object.assign(this, defaultState)
        }
    }
});

export default vocabStore