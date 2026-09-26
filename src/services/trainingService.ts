import axiosClient from "../http/axiosclient";
import type { ApiResponse } from "./ApiResponse"
import type { TrainingCheckpointEntry } from "./TrainingCheckpointEntry";
import type { CorpusCreateRequest, CorpusPreviewRequest, CorpusPreprocessReport, TrainingCorpusDetail, TrainingCorpusEntry, TrainingFileRequest } from "./TrainingFileRequest"
import type { TrainingProgressResponse } from "./TrainingProgressResponse";
import type { TrainingRequest } from "./TrainingRequest";
import type { TrainingResponse } from "./TrainingResponse"

const appendPreprocessOptions = (formData: FormData, req: CorpusPreviewRequest | TrainingFileRequest): void => {
    if (req.format) formData.append("format", req.format);
    if (req.textField) formData.append("textField", req.textField);
    if (req.template) formData.append("template", req.template);
    formData.append("normalizeWhitespace", String(req.normalizeWhitespace ?? true));
    formData.append("stripHtml", String(req.stripHtml ?? false));
    formData.append("deduplicate", String(req.deduplicate ?? true));
    formData.append("minChars", String(req.minChars ?? 0));
    formData.append("maxChars", String(req.maxChars ?? 0));
};

const createJobFromFile = async (req: TrainingFileRequest): Promise<ApiResponse<TrainingResponse>> => {

    const formData = new FormData();

    req.textFiles.forEach((file) => {
        formData.append('textFiles', file);
    });
    if (req.trainingCorpusId) {
        formData.append("trainingCorpusId", req.trainingCorpusId);
    }
    formData.append("transformerModelId", req.transformerModelId);
    formData.append("vocabularyId", req.vocabularyId);
    appendPreprocessOptions(formData, req);

    if (req.previousCheckpointId) {
        formData.append("previousCheckpointId", req.previousCheckpointId);
    }

    var response = await axiosClient.post('/train/file', formData );

    return response.data;
}

/** Dry-run extract + preprocess. Creates no job and writes no files. */
const previewCorpus = async (req: CorpusPreviewRequest): Promise<ApiResponse<CorpusPreprocessReport>> => {

    const formData = new FormData();

    req.textFiles.forEach((file) => {
        formData.append('textFiles', file);
    });
    appendPreprocessOptions(formData, req);

    var response = await axiosClient.post('/train/preview', formData );

    return response.data;
}

/** Named, reusable corpora: upload once, select for many jobs. */
const createCorpus = async (req: CorpusCreateRequest): Promise<ApiResponse<TrainingCorpusDetail>> => {

    const formData = new FormData();

    formData.append("name", req.name);
    req.textFiles.forEach((file) => {
        formData.append('textFiles', file);
    });
    appendPreprocessOptions(formData, req);

    var response = await axiosClient.post('/corpora/create', formData );

    return response.data;
}

const getAvailableCorpora = async (): Promise<ApiResponse<TrainingCorpusEntry[]>> => {

    var response = await axiosClient.get('/corpora/available');

    return response.data;
}

const deleteCorpus = async (corpusId: string): Promise<ApiResponse<TrainingCorpusDetail>> => {

    var response = await axiosClient.post(`/corpora/${corpusId}/delete`);

    return response.data;
}

const createJob = async (req: TrainingRequest): Promise<ApiResponse<TrainingResponse>> => {

    var response = await axiosClient.post('/train/live', req );
    return response.data;
}

const getTrainingProgress = async (jobId: string): Promise<ApiResponse<TrainingProgressResponse>> => {

    var response = await axiosClient.get('/train/jobs/' + jobId);
    return response.data;
}

const getTrainingJobs = async (): Promise<ApiResponse<TrainingProgressResponse[]>> => {

    var response = await axiosClient.get('/train/jobs');
    return response.data;
}

const getCheckpoints = async (): Promise<ApiResponse<TrainingCheckpointEntry[]>> => {

    var response = await axiosClient.get('/train/checkpoints');
    return response.data;
}
const pauseTrainingJob = async (
  jobId: string
): Promise<ApiResponse<TrainingResponse>> => {
  const response = await axiosClient.post(`/train/jobs/${jobId}/pause`);

  return response.data;
};

const resumeTrainingJob = async (
  jobId: string
): Promise<ApiResponse<TrainingResponse>> => {
  const response = await axiosClient.post(`/train/jobs/${jobId}/resume`);

  return response.data;
};

const cancelTrainingJob = async (
  jobId: string
): Promise<ApiResponse<TrainingResponse>> => {
  const response = await axiosClient.post(`/train/jobs/${jobId}/cancel`);

  return response.data;
};

const stopTrainingJob = async (
  jobId: string
): Promise<ApiResponse<TrainingResponse>> => {
  const response = await axiosClient.post(`/train/jobs/${jobId}/stop`);

  return response.data;
};
//Not yet used but I do intend to use them in the store.
const startTrainingJob = async (
  jobId: string
): Promise<ApiResponse<TrainingResponse>> => {
  const response = await axiosClient.post(`/train/jobs/${jobId}/start`);

  return response.data;
};

const deleteTrainingJob = async (
  jobId: string
): Promise<ApiResponse<TrainingResponse>> => {
  const response = await axiosClient.post(`/train/jobs/${jobId}/delete`);

  return response.data;
};

const resetTrainingJob = async (
  jobId: string
): Promise<ApiResponse<TrainingResponse>> => {
  const response = await axiosClient.post(`/train/jobs/${jobId}/reset`);

  return response.data;
};

export default { 
  createJobFromFile, 
  previewCorpus,
  createCorpus,
  getAvailableCorpora,
  deleteCorpus,
  createJob, 
  getTrainingProgress, 
  getTrainingJobs, 
  getCheckpoints,
  pauseTrainingJob, 
  resumeTrainingJob, 
  cancelTrainingJob, 
  stopTrainingJob,
  startTrainingJob,
  deleteTrainingJob,
  resetTrainingJob
};
