import axiosClient from "../http/axiosclient";
import type { ApiResponse } from "./ApiResponse"
import type { TrainingFileRequest } from "./TrainingFileRequest"
import type { TrainingProgressResponse } from "./TrainingProgressResponse";
import type { TrainingRequest } from "./TrainingRequest";
import type { TrainingResponse } from "./TrainingResponse"

const createJobFromFile = async (req: TrainingFileRequest): Promise<ApiResponse<TrainingResponse>> => {

    const formData = new FormData();

    formData.append('textFile', req.textFile);
    formData.append("transformerModelId", req.transformerModelId);
    formData.append("vocabularyId", req.vocabularyId);

    if (req.previousCheckpoint) 
    {
        formData.append("previousCheckpointId", req.previousCheckpointId);
        formData.append("previousCheckpoint", req.previousCheckpoint);
    }

    console.log(formData.get("textFile"));
    console.log(formData.get("previousCheckpoint"));

    var response = await axiosClient.post('/train/file', formData );

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
  createJob, 
  getTrainingProgress, 
  getTrainingJobs, 
  pauseTrainingJob, 
  resumeTrainingJob, 
  cancelTrainingJob, 
  stopTrainingJob,
  startTrainingJob,
  deleteTrainingJob,
  resetTrainingJob
};
