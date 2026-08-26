<script lang="ts" setup>
import {
BContainer,
  BCard,
  BCardBody,
  BCardHeader,
  BRow,
  BCol,
  BButton,
  BForm,
  BFormRadioGroup,
  BFormGroup,
  BFormInput,
  BFormTextarea,
  BFormSelect,
  BFormFile,
  BTable,
  BTabs,
  BTab,
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

const liveInput = ref("");
const trainingFileInput = ref<File | null>(null);
const previousCheckpoint = ref("");
const selectedConfig = ref("adamw");

const customConfig = ref(defaultAdamWTrainingConfig);

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

var pollingTimer: ReturnType<typeof setInterval> | null = null;

const refreshJobs = async () => {
  await store.getTrainingJobs();
};

onUnmounted(() => {
  stopJobPolling();
});

onMounted(() => {
  refreshJobs();
})

const jobFields: TableField<TrainingProgressResponse>[] = [
    {
        key: "jobId",
        label: "Job ID",
    },
    {
        key: "status",
        label: "Status",
        formatter: ({ value }) => {
        return TrainingJobStatus[value as TrainingJobStatus];
        },
    },
    {
        key: "currentEpoch",
        label: "Epoch",
        formatter: ({ value, item }) => {
        return `${value} / ${item.totalEpochs}`;
        },
    },
    {
        key: "currentBatch",
        label: "Batch",
        formatter: ({ value, item }) => {
        return `${value} / ${item.totalBatches}`;
        },
    },
    {
        key: "currentLoss",
        label: "Loss",
        formatter: ({ value }) => {
        return Number(value).toFixed(6);
        },
    },
    {
        key: "message",
        label: "Message",
    },
    {
        key: "lastUpdatedAt",
        label: "Updated",
        formatter: ({ value }) => {
        return new Date(value as string).toLocaleString();
        },
    },
];

const stopJobPolling = () => {
  if (pollingTimer !== null) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
};

type TrainingConfigPreset = {
  label: string;
  value: string;
  config: TrainingConfig;
};

const trainingConfigOptions: TrainingConfigPreset[] = [
  {
    label: "AdamW Default",
    value: "adamw",
    config: defaultAdamWTrainingConfig,
  },
  {
    label: "SGD Default",
    value: "sgd",
    config: defaultSgdTrainingConfig,
  },
  {
    label: "Custom",
    value: "custom",
    config: defaultAdamWTrainingConfig,
  },
];
const store = trainingStore();

const currentJobs = computed(() => store.currentJobs?.data ?? []);

const reset = () => {
  // Clear any pending request inputs.
};

const getSelectedConfig = (): TrainingConfig | undefined => {
  return trainingConfigOptions.find((option) => option.value === selectedConfig.value)
    ?.config;
};

const trainFromLiveInput = () => {
  const config = getSelectedConfig();

  if (!config) {
    return;
  }

  store.trainFromLiveInput(liveInput.value, JSON.stringify(config), previousCheckpoint.value);
};

const trainFromFile = () => {
  const config = getSelectedConfig();

  if (!config || !trainingFileInput.value) {
    return;
  }

  // Depending on your backend design, you'll either
  // upload trainingFileInput.value or extract an identifier.
  store.trainFromFile(trainingFileInput.value, JSON.stringify(config), previousCheckpoint.value);
};

const hasActiveJobs = computed(() =>
  currentJobs.value.some((job) =>
    [
      TrainingJobStatus.Pending,
      TrainingJobStatus.Running,
      TrainingJobStatus.Started,
    ].includes(job.status)
  )
);

const startJobPolling = async () => {
  await store.getTrainingJobs();

  if (!hasActiveJobs.value) {
    stopJobPolling();
  }
};

const handleTabChange = (event: {
  newTabId: string;
  prevTabId: string;
  newTabIndex: number;
  prevTabIndex: number;
  event: unknown;
}) => {
  if (event.newTabId === "training-jobs") {
    startJobPolling();
  } else {
    stopJobPolling();
  }
};
</script>

<template>
  <BContainer fluid class="py-4">
    <BCard>
      <BCardHeader>
        <div class="d-flex justify-content-between align-items-center">
          <h3 class="mb-0">Training</h3>

          <BButton variant="outline-secondary" size="sm" @click="reset"> Reset </BButton>
        </div>
      </BCardHeader>

      <BCardBody>
        <BTabs @activate-tab="handleTabChange">
          <BTab id="live-input" title="Live Input">
            <BForm @submit.prevent="trainFromLiveInput">
              <BFormGroup
                label="Train from live input"
                label-for="live-input"
                class="mb-3"
              >
                <BFormTextarea
                  id="live-input"
                  v-model="liveInput"
                  rows="6"
                  placeholder="Enter text for the model..."
                />
              </BFormGroup>
              <!--Configuration-->
              <BFormGroup label="Configuration" label-for="configuration" class="mb-3">
                <BFormSelect
                  id="configuration"
                  v-model="selectedConfig"
                  :options="trainingConfigOptions"
                  text-field="label"
                  value-field="value"
                />
              </BFormGroup>
              <BFormGroup
                label="Previous Checkpoint"
                label-for="checkpoint"
                class="mb-3"
                description="Leave empty to start a new training session."
              >
                <BFormInput id="checkpoint" v-model="previousCheckpoint" type="text" />
              </BFormGroup>
              <BFormGroup class="mb-3">
                <BButton type="submit" variant="primary">Train with this input</BButton>
                <BButton type="reset" variant="secondary">Cancel</BButton>
              </BFormGroup>
            </BForm>
          </BTab>
          <BTab id="file-input" title="File Input">
            <BForm @submit.prevent="trainFromFile">
              <BFormGroup label="Train from file" label-for="file" class="mb-3">
                <!--Use a file input element to select a file-->
                <BFormFile
                  id="training-file"
                  v-model="trainingFileInput"
                  accept=".txt"
                  browse-text="Browse"
                />
              </BFormGroup>
              <!--Configuration-->
              <BFormGroup label="Configuration" label-for="configuration" class="mb-3">
                <BFormSelect
                  id="configuration"
                  v-model="selectedConfig"
                  :options="trainingConfigOptions"
                  text-field="label"
                  value-field="value"
                />
              </BFormGroup>
              <!--Previous checkpoint-->
              <BFormGroup
                label="Previous Checkpoint"
                label-for="checkpoint"
                class="mb-3"
                description="Leave empty to start a new training session."
              >
                <BFormInput id="checkpoint" v-model="previousCheckpoint" type="text" />
              </BFormGroup>
              <BFormGroup class="mb-3">
                <BButton type="submit" variant="primary">Train with this file</BButton>
                <BButton type="reset" variant="secondary">Cancel</BButton>
              </BFormGroup>
            </BForm>
          </BTab>

          <BTab id="training-jobs" title="Training jobs">
            <BRow>
              <BButton @click="refreshJobs">Refresh</BButton>
            </BRow>
            <!--While this tab is active, start polling for training jobs-->
            <BTable
              v-if="currentJobs.length > 0"
              :items="currentJobs"
              :fields="jobFields"
              responsive
              striped
              hover
            />
            <p v-else>No training jobs found.</p>
          </BTab>
        </BTabs>
      </BCardBody>
    </BCard>
    <BCard v-if="selectedConfig === 'custom'" class="mt-4">
      <BCardHeader> Custom Training Configuration </BCardHeader>

      <BCardBody>
        <BFormGroup label="Optimizer">
          <BFormRadioGroup
            v-model="customConfig.Optimizer"
            :options="optimizerOptions"
            name="optimizer"
          />
        </BFormGroup>
        <BRow>
          <BCol md="6">
            <BFormGroup label="Learning Rate">
              <BFormInput
                v-model.number="customConfig.LearningRate"
                type="number"
                min="0"
                step="0.0001"
              />
            </BFormGroup>
            <!--Epochs-->
            <BFormGroup label="Epochs">
              <BFormInput v-model.number="customConfig.Epochs" type="number" min="1" />
            </BFormGroup>
            <!--Dropout Rate-->
            <BFormGroup label="Dropout Rate">
              <BFormInput
                v-model.number="customConfig.DropoutRate"
                type="number"
                min="0"
                step="0.1"
              />
            </BFormGroup>
          </BCol>

          <BCol md="6">
            <BFormGroup label="Batch Size">
              <BFormInput v-model.number="customConfig.BatchSize" type="number" min="1" />
            </BFormGroup>
            <!--Gradient Clipping-->
            <BFormGroup label="Max Gradient Norm">
              <BFormInput
                v-model.number="customConfig.MaxGradientNorm"
                type="number"
                min="0"
              />
            </BFormGroup>
            <!--Weight Decay-->
            <BFormGroup label="Weight Decay">
              <BFormInput
                v-model.number="customConfig.WeightDecay"
                type="number"
                min="0"
                step="0.0001"
              />
            </BFormGroup>
          </BCol>
        </BRow>
      </BCardBody>
    </BCard>
  </BContainer>
</template>
