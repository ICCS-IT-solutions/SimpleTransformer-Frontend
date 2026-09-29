<script lang="ts" setup>
import {
  BRow,
  BCol,
  BCard,
  BCardBody,
  BCardTitle,
  BCardText,
  BButton,
  BBadge,
  BProgress,
  BSpinner,
} from "bootstrap-vue-next";
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { TransformerModelResponse } from "../services/TransformerModelResponse";
import transformerModelStore from "../stores/transformerModelStore";
import trainingStore from "../stores/trainingStore";
import { TrainingJobStatus } from "../services/TrainingJobStatus";
import type { TrainingProgressResponse } from "../services/TrainingProgressResponse";

const modelStore = transformerModelStore();
const trainStore = trainingStore();

//The model currently resident in the backend (name + runtime-resolved
//acceleration backend), so the landing page reflects live server state.
const activeModel = ref<TransformerModelResponse | null>(null);

const refreshActiveModel = async () => {
  try {
    const response = await modelStore.getActiveModel();
    activeModel.value = response.data ?? null;
  } catch {
    activeModel.value = null;
  }
};

/*
 * --- Training status -----------------------------------------------------
 * The card reports one of three states: a live job, the most recent
 * completed job, or no job at all.
 */

// Jobs still owned by the system: running, or resumable/stoppable by the user.
// Stopped and Paused are deliberately not "completed" - they can be resumed,
// and the backend keeps their checkpoint.
const ACTIVE_STATUSES: TrainingJobStatus[] = [
  TrainingJobStatus.Running,
  TrainingJobStatus.Started,
  TrainingJobStatus.Paused,
  TrainingJobStatus.Pending,
  TrainingJobStatus.Stopped,
];

const jobs = ref<TrainingProgressResponse[]>([]);
const jobsError = ref(false);
const jobsLoading = ref(true);

const refreshJobs = async () => {
  try {
    // The store action assigns the shared currentJobs; the backend does not
    // order the list, so the newest job is picked client-side below.
    await trainStore.getTrainingJobs();
    jobs.value = trainStore.currentJobs?.data ?? [];
    jobsError.value = false;
  } catch {
    // An offline backend should read as "unknown", not crash the landing page.
    jobsError.value = true;
    jobs.value = [];
  } finally {
    jobsLoading.value = false;
  }
};

const toTime = (value?: string) => {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value).getTime();

  return Number.isNaN(parsed) ? 0 : parsed;
};

// Newest by last-updated: that reflects the job the user most recently acted
// on, and for running jobs it is also the live progress clock.
const activeJob = computed<TrainingProgressResponse | null>(() => {
  const active = jobs.value.filter((job) => ACTIVE_STATUSES.includes(job.status));

  if (active.length === 0) {
    return null;
  }

  return active.reduce((newest, job) =>
    toTime(job.lastUpdatedAt) > toTime(newest.lastUpdatedAt) ? job : newest
  );
});

const completedJob = computed<TrainingProgressResponse | null>(() => {
  const completed = jobs.value.filter(
    (job) => job.status === TrainingJobStatus.Completed
  );

  if (completed.length === 0) {
    return null;
  }

  return completed.reduce((newest, job) =>
    toTime(job.completedAt) > toTime(newest.completedAt) ? job : newest
  );
});

const getStatusText = (status: TrainingJobStatus) =>
  TrainingJobStatus[status] ?? "Unknown";

const getStatusVariant = (status: TrainingJobStatus) => {
  switch (status) {
    case TrainingJobStatus.Running:
    case TrainingJobStatus.Started:
      return "primary";
    case TrainingJobStatus.Paused:
      return "warning";
    case TrainingJobStatus.Stopped:
      return "dark";
    case TrainingJobStatus.Pending:
      return "secondary";
    case TrainingJobStatus.Completed:
      return "success";
    case TrainingJobStatus.Failed:
      return "danger";
    case TrainingJobStatus.Cancelled:
      return "dark";
    default:
      return "secondary";
  }
};

// Epoch-level progress, matching TrainingView. Jobs without a known epoch
// count (queued, or stopped before the first epoch) report 0 rather than NaN.
const getProgress = (job: TrainingProgressResponse) => {
  if (!job.totalEpochs || job.totalEpochs <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((job.currentEpoch / job.totalEpochs) * 100));
};

// "Epoch 2 / 10" plus the inner batch counters when the job reports them.
const getPosition = (job: TrainingProgressResponse) => {
  const parts = [`Epoch ${job.currentEpoch} / ${job.totalEpochs}`];

  if (job.totalBatches > 0) {
    parts.push(`batch ${job.currentBatch} / ${job.totalBatches}`);
  }

  if (job.numSubBatches > 1) {
    parts.push(`sub-batch ${job.currentSubBatch} / ${job.numSubBatches}`);
  }

  return parts.join(" \u00b7 ");
};

// Only poll while a job is actually in flight; a static history never changes.
let pollHandle: ReturnType<typeof setInterval> | null = null;

const stopPolling = () => {
  if (pollHandle !== null) {
    clearInterval(pollHandle);
    pollHandle = null;
  }
};

const syncPolling = () => {
  const shouldPoll =
    activeJob.value !== null
    && (activeJob.value.status === TrainingJobStatus.Running
      || activeJob.value.status === TrainingJobStatus.Started);

  if (shouldPoll && pollHandle === null) {
    pollHandle = setInterval(refreshJobs, 5_000);
  } else if (!shouldPoll) {
    stopPolling();
  }
};

onMounted(async () => {
  await refreshActiveModel();
  await refreshJobs();
  syncPolling();
});

onUnmounted(stopPolling);
</script>

<template>
  <div class="container-fluid px-4 py-5">

    <!-- Hero -->
    <section class="text-center mb-5">
      <div class="mb-3">
        <i class="bi bi-cpu display-3"></i>
      </div>

      <h1 class="display-4 fw-bold mb-3">
        SimpleTransformer
      </h1>

      <p class="lead text-muted mb-3">
        A transformer model implementation and training environment
        built entirely in C#.
      </p>

      <div class="d-flex justify-content-center align-items-center gap-2" v-if="!modelStore.loading_activeModel">
        <BBadge variant="success">
          <i class="bi bi-circle-fill me-1"></i>
          {{ modelStore.model?.name ?? "No model loaded" }}
        </BBadge>
        
        <!--Make this dynamic once the acceleration backend has been properly decoupled from the server-->
        <BBadge variant="secondary">
          {{ modelStore.activeBackend ?? "N/A"}}
        </BBadge>
      </div>
      <div v-else-if="modelStore.loading_activeModel">
        <BBadge variant="warning">
          <i class="bi bi-circle-fill me-1"></i>
          Waiting for response from backend
        </BBadge>
      </div>
      <div v-else>
        <BBadge variant="danger">
          <i class="bi bi-circle-fill me-1"></i>
          Backend offline
        </BBadge>
      </div>
    </section>


    <!-- Primary applications -->
    <BRow class="g-4 mb-4">

      <!-- Inference -->
      <BCol lg="4" md="6">
        <BCard class="h-100 shadow-sm">
          <BCardBody class="d-flex flex-column">

            <div class="feature-icon mb-3">
              <i class="bi bi-chat-square-text"></i>
            </div>

            <BCardTitle>
              Inference
            </BCardTitle>

            <BCardText class="text-muted">
              Send prompts to the transformer and inspect generated
              predictions directly from your browser.
            </BCardText>

            <div class="mt-auto">
              <BButton
                :to="{ name: 'infer' }"
                variant="primary"
              >
                <i class="bi bi-play-fill me-1"></i>
                Open Inference
              </BButton>
            </div>

          </BCardBody>
        </BCard>
      </BCol>


      <!-- Training -->
      <BCol lg="4" md="6">
        <BCard class="h-100 shadow-sm">
          <BCardBody class="d-flex flex-column">

            <div class="feature-icon mb-3">
              <i class="bi bi-graph-up-arrow"></i>
            </div>

            <BCardTitle>
              Training
            </BCardTitle>

            <BCardText class="text-muted">
              Configure and train the model using source files or
              live training data while monitoring training progress.
            </BCardText>

            <div class="mt-auto">
              <BButton
                :to="{ name: 'train' }"
                variant="success"
              >
                <i class="bi bi-play-fill me-1"></i>
                Open Training
              </BButton>
            </div>

          </BCardBody>
        </BCard>
      </BCol>


      <!-- Vocabulary -->
      <BCol lg="4" md="6">
        <BCard class="h-100 shadow-sm">
          <BCardBody class="d-flex flex-column">

            <div class="feature-icon mb-3">
              <i class="bi bi-book"></i>
            </div>

            <BCardTitle>
              Vocabulary
            </BCardTitle>

            <BCardText class="text-muted">
              Upload training sources, compile vocabularies and
              inspect the tokenizer configuration used by the model.
            </BCardText>

            <div class="mt-auto">
              <BButton
                :to="{ name: 'vocab' }"
                variant="warning"
              >
                <i class="bi bi-arrow-right me-1"></i>
                Open Vocabulary
              </BButton>
            </div>

          </BCardBody>
        </BCard>
      </BCol>

    </BRow>


    <!-- System overview -->
    <BRow class="g-4">

      <BCol lg="8">
        <BCard class="h-100 shadow-sm">
          <BCardBody>

            <BCardTitle>
              <i class="bi bi-activity me-2"></i>
              Training Status
            </BCardTitle>

            <div
              v-if="jobsLoading"
              class="text-muted py-3"
            >
              <BSpinner
                small
                class="me-2"
              />
              Waiting for response from backend
            </div>

            <!-- Backend unreachable: unknown, distinct from "no jobs". -->
            <div
              v-else-if="jobsError"
              class="py-3"
            >
              <BBadge variant="danger">
                <i class="bi bi-circle-fill me-1"></i>
                Backend offline
              </BBadge>
              <div class="small text-muted mt-2">
                Training status is unavailable while the backend cannot be reached.
              </div>
            </div>

            <!-- State 1: a job is active on this system. -->
            <div
              v-else-if="activeJob"
              class="py-2"
            >
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div class="fw-semibold">
                    {{ activeJob.name || "Unnamed job" }}
                  </div>
                  <div class="small text-muted">
                    {{ activeJob.transformerModelName || activeJob.transformerModelId }}
                  </div>
                </div>

                <BBadge :variant="getStatusVariant(activeJob.status)">
                  {{ getStatusText(activeJob.status) }}
                </BBadge>
              </div>

              <BProgress
                :value="getProgress(activeJob)"
                height="8px"
                class="mb-2"
              />

              <div class="small text-muted">
                {{ getPosition(activeJob) }}
                <span v-if="activeJob.currentLoss"> · loss {{ activeJob.currentLoss.toFixed(4) }}</span>
              </div>

              <div
                v-if="activeJob.checkpoint"
                class="small text-muted"
              >
                Checkpoint: <span class="font-monospace">{{ activeJob.checkpoint }}</span>
              </div>

              <div
                v-if="activeJob.error"
                class="small text-danger mt-1"
              >
                {{ activeJob.error }}
              </div>

              <BButton
                :to="{ name: 'train' }"
                variant="primary"
                size="sm"
                class="mt-3"
              >
                <i class="bi bi-graph-up-arrow me-1"></i>
                Open Training
              </BButton>
            </div>

            <!-- State 2: nothing active, but a job has completed before. -->
            <div
              v-else-if="completedJob"
              class="py-2"
            >
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div class="fw-semibold">
                    {{ completedJob.name || "Unnamed job" }}
                  </div>
                  <div class="small text-muted">
                    {{ completedJob.transformerModelName || completedJob.transformerModelId }}
                  </div>
                </div>

                <BBadge :variant="getStatusVariant(completedJob.status)">
                  {{ getStatusText(completedJob.status) }}
                </BBadge>
              </div>

              <div class="small text-muted">
                Last run finished {{ completedJob.totalEpochs }} epoch(s){{ completedJob.currentLoss ? ` at loss ${completedJob.currentLoss.toFixed(4)}` : "" }}.
                No job is currently active.
              </div>

              <div
                v-if="completedJob.checkpoint"
                class="small text-muted"
              >
                Checkpoint: <span class="font-monospace">{{ completedJob.checkpoint }}</span>
              </div>

              <BButton
                :to="{ name: 'train' }"
                variant="outline-primary"
                size="sm"
                class="mt-3"
              >
                <i class="bi bi-graph-up-arrow me-1"></i>
                Open Training
              </BButton>
            </div>

            <!-- State 3: no active and no completed job. -->
            <div
              v-else
              class="text-muted py-3"
            >
              <i class="bi bi-inbox me-2"></i>
              No active or completed training job.
              <div
                v-if="jobs.length > 0"
                class="small mt-1"
              >
                {{ jobs.length }} job(s) recorded, but none are active or completed.
              </div>
            </div>

          </BCardBody>
        </BCard>
      </BCol>


      <BCol lg="4">
        <BCard class="h-100 shadow-sm">
          <BCardBody>

            <BCardTitle>
              <i class="bi bi-cpu me-2"></i>
              Model
            </BCardTitle>

            <div class="small text-muted mb-1">
              Loaded model
            </div>

            <div class="fw-semibold mb-3">
              {{ activeModel?.model?.name ?? "No model loaded" }}
            </div>

            <div class="small text-muted mb-1">
              Acceleration backend
            </div>

            <div class="fw-semibold">
              {{ activeModel?.activeBackend ?? "—" }}
            </div>

          </BCardBody>
        </BCard>
      </BCol>

    </BRow>

  </div>
</template>

<style scoped>
.feature-icon {
  font-size: 2rem;
}

.feature-icon i {
  opacity: 0.85;
}
</style>