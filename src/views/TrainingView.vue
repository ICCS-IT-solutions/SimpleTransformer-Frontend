```vue
<script lang="ts" setup>
import {
  BContainer,
  BCard,
  BCardHeader,
  BCardBody,
  BCardTitle,
  BRow,
  BCol,
  BButton,
  BForm,
  BFormGroup,
  BFormInput,
  BFormTextarea,
  BFormSelect,
  BFormFile,
  BFormRadioGroup,
  BTable,
  BTabs,
  BTab,
  BBadge,
  BProgress,
  BProgressBar,
  BAlert,
  BListGroup,
  BListGroupItem,
  type TableField,
} from "bootstrap-vue-next";

import trainingStore, {
  defaultAdamWTrainingConfig,
  defaultSgdTrainingConfig,
} from "../stores/trainingStore";

import { computed, ref, onMounted, onUnmounted } from "vue";

import type { TrainingConfig } from "../services/TrainingConfig";
import { OptimizerType } from "../services/OptimizerType";
import { TrainingJobStatus } from "../services/TrainingJobStatus";
import type { TrainingProgressResponse } from "../services/TrainingProgressResponse";

const store = trainingStore();

const liveInput = ref("");
const trainingFileInput = ref<File | null>(null);
const previousCheckpoint = ref("");
const selectedConfig = ref("adamw");
const isSubmitting = ref(false);

const customConfig = ref<TrainingConfig>({
  ...defaultAdamWTrainingConfig,
});

const optimizerOptions = [
  {
    text: "AdamW",
    value: OptimizerType.AdamW,
  },
  {
    text: "SGD",
    value: OptimizerType.Sgd,
  },
];

type TrainingConfigPreset = {
  label: string;
  value: string;
  description: string;
  config: TrainingConfig;
};

var refreshTimer: string | number | NodeJS.Timeout | null | undefined = null;

const refreshAll = async () => {
  await store.getModels();
  await store.getTrainingConfigs();
  await store.getVocabularies();
  await store.getTrainingJobs();
}

const resumeJob = async (jobId:string) => {
  await store.resumeTrainingJob(jobId);
}

const pauseJob = async (jobId:string) => {
  await store.pauseTrainingJob(jobId);
}

const stopJob = async (jobId:string) => {
  await store.stopTrainingJob(jobId);
}

const startJob = async (jobId:string) => {
  await store.startTrainingJob(jobId);
}

const cancelJob = async (jobId:string) => {
  await store.cancelTrainingJob(jobId);
}

onMounted(async () => {
  await refreshAll();
  setTimeout(async () => refreshTimer, 5000);
});

onUnmounted(async () => {
  if(refreshTimer) {
    clearTimeout(refreshTimer);
  };
});

const availableModels = computed(() =>
  (store.availableModels ?? []).map(model => ({
    value: model.entryId,
    text: model.name,
  }))
);

const availableVocabularies = computed(() =>
  (store.availableVocabularies ?? []).map(vocabulary => ({
    value: vocabulary.entryId,
    text: vocabulary.name,
  }))
);

const trainingConfigOptions = computed<TrainingConfigPreset[]>(() => {
  const staticDefaults: TrainingConfigPreset[] = [
    {
      label: "AdamW Default",
      value: "adamw",
      description: "Recommended general-purpose Transformer configuration.",
      config: defaultAdamWTrainingConfig,
    },
    {
      label: "SGD Default",
      value: "sgd",
      description: "SGD with momentum and Nesterov acceleration.",
      config: defaultSgdTrainingConfig,
    },
  ];

  const customOption: TrainingConfigPreset = {
    label: "Custom",
    value: "custom",
    description: "Configure the optimizer and training parameters manually.",
    config: customConfig.value,
  };

  return [
    ...staticDefaults,
    ...additionalTrainingConfigPresets.value,
    customOption,
  ];
});

const additionalTrainingConfigPresets = computed<TrainingConfigPreset[]>(() => {
  const configEntries = store.trainingConfigResponse?.trainingConfigs;

  if (!configEntries) return [];

  return configEntries.map(entry => ({
    label: entry.name,
    value: entry.entryId ?? entry.name,
    description: entry.description,
    config: { ...entry.config },
  }));
});

const currentJobs = computed(() => store.currentJobs?.data ?? []);

const selectedPreset = computed(() =>
  trainingConfigOptions.value.find(
    (option: { value: string }) => option.value === selectedConfig.value
  )
);

const selectedTrainingConfig = computed<TrainingConfig>(() => {
  if (selectedConfig.value === "custom") {
    return customConfig.value;
  }

  return selectedPreset.value?.config ?? defaultAdamWTrainingConfig;
});

const activeJobs = computed(() =>
  currentJobs.value.filter(job =>
    [
      TrainingJobStatus.Pending,
      TrainingJobStatus.Running,
      TrainingJobStatus.Started,
    ].includes(job.status)
  )
);

const getStatusText = (status: TrainingJobStatus) => {
  return TrainingJobStatus[status] ?? "Unknown";
};

const getStatusVariant = (status: TrainingJobStatus) => {
  switch (status) {
    case TrainingJobStatus.Pending:
      return "secondary";

    case TrainingJobStatus.Started:
    case TrainingJobStatus.Running:
      return "primary";

    default:
      return "secondary";
  }
};

const getProgress = (job: TrainingProgressResponse) => {
  if (!job.totalEpochs || job.totalEpochs <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round((job.currentEpoch / job.totalEpochs) * 100)
  );
};

const jobFields: TableField<TrainingProgressResponse>[] = [
  {
    key: "name",
    label: "Job",
  },
  {
    key: "status",
    label: "Status",
  },
  {
    key: "progress",
    label: "Progress",
  },
  {
    key: "currentEpoch",
    label: "Epoch",
  },
  {
    key: "currentBatch",
    label: "Batch",
  },
  {
    key: "currentLoss",
    label: "Loss",
    formatter: ({ value }) => Number(value).toFixed(6),
  },
  {
    key: "lastUpdatedAt",
    label: "Updated",
    formatter: ({ value }) =>
      new Date(value as string).toLocaleString(),
  },
  {
    key: "actions",
    label: "Actions",
  },
];

const handleTabChange = (event: {
  newTabId: string;
  prevTabId: string;
  newTabIndex: number;
  prevTabIndex: number;
  event: unknown;
}) => {
  if (event.newTabId === "training-jobs") {

  }
};

const trainFromLiveInput = async () => {
  if (!liveInput.value.trim()) {
    return;
  }

  isSubmitting.value = true;

  try {
    await store.createJob(
      liveInput.value,
      store.transformerModelId,
      store.vocabularyId,
      //Model and vocabulary ID's need to be passed here
      previousCheckpoint.value
    );

  } finally {
    isSubmitting.value = false;
  }
};

const trainFromFile = async () => {
  if (!trainingFileInput.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    await store.createJobFromFile(
      trainingFileInput.value,
      store.transformerModelId,
      store.vocabularyId,
      //Model and vocabulary ID's need to be passed here
      previousCheckpoint.value
    );

  } finally {
    isSubmitting.value = false;
  }
};

const reset = () => {
  liveInput.value = "";
  trainingFileInput.value = null;
  previousCheckpoint.value = "";
  selectedConfig.value = "adamw";

  customConfig.value = {
    ...defaultAdamWTrainingConfig,
  };
};





</script>

<template>
  <BContainer fluid class="py-4">
    <BCard>
      <BCardHeader>
        <!-- Page heading -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            
            <h2 class="mb-1"><i class="bi bi-graph-up-arrow me-1"></i>Training</h2>
            <p class="text-muted mb-0">
              Create and monitor Transformer training jobs.
            </p>
          </div>

          <BButton
            variant="outline-secondary"
            @click="reset"
          >
            Reset
          </BButton>
        </div>
      </BCardHeader>
      <BCardBody>
        <!-- Active jobs summary -->
        <BAlert
          v-if="activeJobs.length > 0"
          variant="primary"
          show
          class="mb-4"
        >
          <strong>{{ activeJobs.length }}</strong>
          training job{{ activeJobs.length === 1 ? "" : "s" }}
          currently running.
        </BAlert>

        <BTabs
          content-class="mt-3"
          @activate-tab="handleTabChange"
        >

          <!-- ====================================================== -->
          <!-- LIVE INPUT                                             -->
          <!-- ====================================================== -->

          <BTab
            id="live-input"
            title="Live Training"
          >
            <BRow class="g-4">

              <BCol lg="8">
                <BCard class="h-100">
                  <BCardHeader>
                    <BCardTitle class="mb-0">
                      Train from live input
                    </BCardTitle>
                  </BCardHeader>

                  <BCardBody>
                    <BForm @submit.prevent="trainFromLiveInput">

                      <BFormGroup
                        label="Training data"
                        label-for="live-input"
                        description="Enter text that will be supplied to the training pipeline."
                        class="mb-4"
                      >
                        <BFormTextarea
                          id="live-input"
                          v-model="liveInput"
                          rows="12"
                          placeholder="Enter training text..."
                        />
                      </BFormGroup>
                      <!-- Model selector -->
                      <BFormGroup
                        label="Model"
                        label-for="model-selector"
                        class="mb-3"
                      >
                        <BFormSelect
                          id="model-selector"
                          v-model="store.transformerModelId"
                          :options="availableModels"
                        />
                    </BFormGroup>
                    <!--Vocab selector -->
                    <BFormGroup
                        label="Vocab"
                        label-for="vocab-selector"
                        class="mb-3"
                      >
                        <BFormSelect
                          id="vocab-selector"
                          v-model="store.vocabularyId"
                          :options="availableVocabularies"
                        />
                    </BFormGroup>

                      <BRow>
                        <BCol md="6">
                          <BFormGroup
                            label="Previous checkpoint"
                            label-for="live-checkpoint"
                            description="Optional. Leave empty to start from scratch."
                            class="mb-3"
                          >
                            <BFormInput
                              id="live-checkpoint"
                              v-model="previousCheckpoint"
                              placeholder="Checkpoint ID"
                            />
                          </BFormGroup>
                        </BCol>
                      </BRow>

                      <div class="d-flex justify-content-end gap-2 mt-3">
                        <BButton
                          type="button"
                          variant="secondary"
                          @click="reset"
                        >
                          Clear
                        </BButton>

                        <BButton
                          type="submit"
                          variant="primary"
                          :disabled="!liveInput.trim() || isSubmitting"
                        >
                          {{ isSubmitting ? "Starting..." : "Start Training" }}
                        </BButton>
                      </div>

                    </BForm>
                  </BCardBody>
                </BCard>
              </BCol>

              <!-- Configuration summary -->
              <BCol lg="4">
                <BCard class="h-100">
                  <BCardHeader>
                    <BCardTitle class="mb-0">
                      Configuration
                    </BCardTitle>
                  </BCardHeader>

                  <BCardBody>

                    <h5>
                      {{ selectedPreset?.label }}
                    </h5>

                    <p class="text-muted">
                      {{ selectedPreset?.description }}
                    </p>

                    <BListGroup flush>
                      <BListGroupItem
                        class="d-flex justify-content-between px-0"
                      >
                        <span>Optimizer</span>
                        <strong>
                          {{ OptimizerType[selectedTrainingConfig.optimizer] }}
                        </strong>
                      </BListGroupItem>

                      <BListGroupItem
                        class="d-flex justify-content-between px-0"
                      >
                        <span>Learning rate</span>
                        <strong>
                          {{ selectedTrainingConfig.learningRate }}
                        </strong>
                      </BListGroupItem>

                      <BListGroupItem
                        class="d-flex justify-content-between px-0"
                      >
                        <span>Batch size</span>
                        <strong>
                          {{ selectedTrainingConfig.batchSize }}
                        </strong>
                      </BListGroupItem>

                      <BListGroupItem
                        class="d-flex justify-content-between px-0"
                      >
                        <span>Epochs</span>
                        <strong>
                          {{ selectedTrainingConfig.epochs }}
                        </strong>
                      </BListGroupItem>

                      <BListGroupItem
                        class="d-flex justify-content-between px-0"
                      >
                        <span>Dropout</span>
                        <strong>
                          {{ selectedTrainingConfig.dropoutRate }}
                        </strong>
                      </BListGroupItem>
                    </BListGroup>

                    <BButton
                      v-if="selectedConfig === 'custom'"
                      variant="outline-primary"
                      class="w-100 mt-4"
                      href="#custom-training-config"
                    >
                      Edit Configuration
                    </BButton>

                  </BCardBody>
                </BCard>
              </BCol>

            </BRow>
          </BTab>

          <!-- ====================================================== -->
          <!-- FILE INPUT                                             -->
          <!-- ====================================================== -->

          <BTab
            id="file-input"
            title="File Training"
          >
            <BRow class="g-4">

              <BCol lg="8">
                <BCard>
                  <BCardHeader>
                    <BCardTitle class="mb-0">
                      Train from file
                    </BCardTitle>
                  </BCardHeader>

                  <BCardBody>
                    <BForm @submit.prevent="trainFromFile">

                      <BFormGroup
                        label="Training file"
                        label-for="training-file"
                        description="Select a plain text training corpus."
                        class="mb-4"
                      >
                        <BFormFile
                          id="training-file"
                          v-model="trainingFileInput"
                          accept=".txt"
                          browse-text="Browse"
                        />
                      </BFormGroup>
                      <!-- Model selector -->
                      <BFormGroup
                        label="Model"
                        label-for="model-selector"
                        class="mb-3"
                      >
                        <BFormSelect
                          id="model-selector"
                          v-model="store.transformerModelId"
                          :options="availableModels"
                        />
                    </BFormGroup> 
                    <!--Vocab selector -->
                    <BFormGroup
                        label="Vocab"
                        label-for="vocab-selector"
                        class="mb-3"
                      >
                        <BFormSelect
                          id="vocab-selector"
                          v-model="store.vocabularyId"
                          :options="availableVocabularies"
                        />
                    </BFormGroup>                     

                      <BFormGroup
                        label="Previous checkpoint"
                        label-for="file-checkpoint"
                        description="Optional. Specify a checkpoint to resume training."
                        class="mb-4"
                      >
                        <BFormInput
                          id="file-checkpoint"
                          v-model="previousCheckpoint"
                          placeholder="Checkpoint ID"
                        />
                      </BFormGroup>

                      <div class="d-flex justify-content-end gap-2">
                        <BButton
                          type="button"
                          variant="secondary"
                          @click="reset"
                        >
                          Clear
                        </BButton>

                        <BButton
                          type="submit"
                          variant="primary"
                          :disabled="!trainingFileInput || isSubmitting"
                        >
                          {{ isSubmitting ? "Starting..." : "Start Training" }}
                        </BButton>
                      </div>

                    </BForm>
                  </BCardBody>
                </BCard>
              </BCol>

              <BCol lg="4">
                <BCard>
                  <BCardHeader>
                    <BCardTitle class="mb-0">
                      Selected configuration
                    </BCardTitle>
                  </BCardHeader>

                  <BCardBody>
                    <h5>{{ selectedPreset?.label }}</h5>

                    <p class="text-muted">
                      {{ selectedPreset?.description }}
                    </p>

                    <small class="text-muted">
                      Learning rate
                    </small>
                    <div class="mb-3">
                      <strong>
                        {{ selectedTrainingConfig.learningRate }}
                      </strong>
                    </div>

                    <small class="text-muted">
                      Batch size
                    </small>
                    <div class="mb-3">
                      <strong>
                        {{ selectedTrainingConfig.batchSize }}
                      </strong>
                    </div>

                    <small class="text-muted">
                      Epochs
                    </small>
                    <div>
                      <strong>
                        {{ selectedTrainingConfig.epochs }}
                      </strong>
                    </div>
                  </BCardBody>
                </BCard>
              </BCol>

            </BRow>
          </BTab>

          <!-- ====================================================== -->
          <!-- TRAINING JOBS                                          -->
          <!-- ====================================================== -->

          <BTab
            id="training-jobs"
            title="Training Jobs"
          >
            <BCard>
              <BCardHeader>
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <BCardTitle class="mb-0">
                      Training Jobs
                    </BCardTitle>

                    <small class="text-muted">
                      Monitor active and completed training jobs.
                    </small>
                  </div>

                  <BButton
                    variant="outline-primary"
                    size="sm"
                    @click="store.getTrainingJobs()"
                  >
                    Refresh
                  </BButton>
                </div>
              </BCardHeader>

              <BCardBody class="p-0">

                <BTable
                  v-if="currentJobs.length > 0"
                  :items="currentJobs"
                  :fields="jobFields"
                  responsive
                  striped
                  hover
                  class="mb-0"
                >

                  <template #cell(status)="{ item }">
                    <BBadge :variant="getStatusVariant(item.status)">
                      {{ getStatusText(item.status) }}
                    </BBadge>
                  </template>

                  <template #cell(progress)="{ item }">
                    <div style="min-width: 140px">
                      <BProgress height="8px">
                        <BProgressBar
                          :value="getProgress(item)"
                        />
                      </BProgress>

                      <small class="text-muted">
                        {{ getProgress(item) }}%
                      </small>
                    </div>
                  </template>

                  <template #cell(currentEpoch)="{ item }">
                    {{ item.currentEpoch }} / {{ item.totalEpochs }}
                  </template>

                  <template #cell(currentBatch)="{ item }">
                    {{ item.currentBatch }} / {{ item.totalBatches }}
                  </template>
                  <!--Pause, resume and cancel buttons -->

                  <template #cell(actions)="{ item }">
                    <div class="d-flex justify-content-end gap-2">
                    <BButton 
                      variant="outline-primary"
                      size="sm"
                      @click="startJob(item.jobId)"
                      >
                        <i class="bi bi-play-circle me-1"></i>
                        Start
                      </BButton>
                    <BButton
                      variant="outline-primary"
                      size="sm"
                      @click="pauseJob(item.jobId)"
                    >
                      <i class="bi bi-pause-circle me-1"></i>
                      Pause
                    </BButton>
                      <BButton
                        variant="outline-primary"
                        size="sm"
                        @click="resumeJob(item.jobId)"
                      >
                        <i class="bi bi-play-circle me-1"></i>
                        Resume
                      </BButton>
                      <BButton variant ="outline-danger" size="sm" @click="stopJob(item.jobId)">
                        <i class="bi bi-stop-circle me-1"></i>
                        Stop
                      </BButton>
                      <BButton
                        variant="outline-danger"
                        size="sm"
                        @click="cancelJob(item.jobId)"
                      >
                        <i class="bi bi-x-circle me-1"></i>
                        Cancel
                      </BButton>
                    </div>
                  </template>



                </BTable>

                <div
                  v-else
                  class="text-center text-muted py-5"
                >
                  <h5>No training jobs</h5>

                  <p class="mb-0">
                    Start a training job using the Live Training or File Training tabs.
                  </p>
                </div>

              </BCardBody>
            </BCard>
          </BTab>

        </BTabs>

        <!-- ====================================================== -->
        <!-- CUSTOM CONFIGURATION                                   -->
        <!-- ====================================================== -->

        <BCard
          v-if="selectedConfig === 'custom'"
          id="custom-training-config"
          class="mt-4"
        >
          <BCardHeader>
            <BCardTitle class="mb-0">
              Custom Training Configuration
            </BCardTitle>
          </BCardHeader>

          <BCardBody>

            <p class="text-muted">
              Override the standard training parameters for this training run.
            </p>

            <BFormGroup
              label="Optimizer"
              class="mb-4"
            >
              <BFormRadioGroup
                v-model="customConfig.optimizer"
                :options="optimizerOptions"
                name="optimizer"
              />
            </BFormGroup>

            <BRow>

              <BCol md="6">

                <BFormGroup
                  label="Learning Rate"
                  class="mb-3"
                >
                  <BFormInput
                    v-model.number="customConfig.learningRate"
                    type="number"
                    min="0"
                    step="0.0001"
                  />
                </BFormGroup>

                <BFormGroup
                  label="Batch Size"
                  class="mb-3"
                >
                  <BFormInput
                    v-model.number="customConfig.batchSize"
                    type="number"
                    min="1"
                  />
                </BFormGroup>

                <BFormGroup
                  label="Epochs"
                  class="mb-3"
                >
                  <BFormInput
                    v-model.number="customConfig.epochs"
                    type="number"
                    min="1"
                  />
                </BFormGroup>

              </BCol>

              <BCol md="6">

                <BFormGroup
                  label="Dropout Rate"
                  class="mb-3"
                >
                  <BFormInput
                    v-model.number="customConfig.dropoutRate"
                    type="number"
                    min="0"
                    max="0.99"
                    step="0.1"
                  />
                </BFormGroup>

                <BFormGroup
                  label="Weight Decay"
                  class="mb-3"
                >
                  <BFormInput
                    v-model.number="customConfig.weightDecay"
                    type="number"
                    min="0"
                    step="0.0001"
                  />
                </BFormGroup>

                <BFormGroup
                  label="Maximum Gradient Norm"
                  class="mb-3"
                >
                  <BFormInput
                    v-model.number="customConfig.maxGradientNorm"
                    type="number"
                    min="0"
                  />
                </BFormGroup>

              </BCol>

            </BRow>

          </BCardBody>
        </BCard>
      </BCardBody>
    </BCard>

  </BContainer>
</template>
```
