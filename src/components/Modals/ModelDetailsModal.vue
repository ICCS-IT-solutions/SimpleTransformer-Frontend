<script lang="ts" setup>
import { computed } from "vue";
import {
  BModal,
  BButton,
  BBadge,
  BRow,
  BCol,
  BTable,
  type TableField,
} from "bootstrap-vue-next";

import ModelSizeSummary from "../ModelSizeSummary.vue";
import type { TransformerModelEntry } from "../../services/TransformerModelEntry";
import type { TransformerConfigEntry } from "../../services/TransformerConfigEntry";
import type { TrainingConfigEntry } from "../../services/TrainingConfigEntry";
import type { AccelerationBackendInfo } from "../../services/AccelerationBackendInfo";
import { OptimizerType } from "../../services/OptimizerType";
import { useDateFormat } from "@vueuse/core";

const visible = defineModel<boolean>({
  required: true,
});

// Null while the entry is still being fetched.
const model = defineModel<TransformerModelEntry | null>("model", {
  required: true,
});

const props = defineProps<{
  transformerConfigs: TransformerConfigEntry[];
  trainingConfigs: TrainingConfigEntry[];
  backends?: AccelerationBackendInfo[];
}>();

const emit = defineEmits<{
  edit: [entry: TransformerModelEntry];
}>();

// Both configs are resolved by id so the modal can show names and the real
// architecture, not raw GUIDs.
const transformerConfig = computed(
  () =>
    props.transformerConfigs.find(
      (config) => config.entryId === model.value?.transformerConfigId
    ) ?? null
);

const trainingConfig = computed(
  () =>
    props.trainingConfigs.find(
      (config) => config.entryId === model.value?.trainingConfigId
    ) ?? null
);

const isLoaded = computed(() => model.value?.isLoaded === true);
const useQLora = computed(() => model.value?.useQLora !== false);

const backendInfo = computed(
  () => props.backends?.find((backend) => backend.name === model.value?.accelerationBackend) ?? null
);

const formatDate = (value?: Date | string) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(new Date(value).getTime())
  ) {
    return "—";
  }

  return useDateFormat(value as string, "DD/MM/YYYY HH:mm").value;
};

const optimizerName = (optimizer: OptimizerType) =>
  OptimizerType[optimizer] ?? "Unknown";

const architectureFields: TableField[] = [
  { key: "label", label: "Property" },
  { key: "value", label: "Value" },
];

const architecture = computed(() => {
  const config = transformerConfig.value?.config;

  if (!config) {
    return [];
  }

  return [
    { label: "Vocabulary size", value: config.vocabSize },
    { label: "Embedding size", value: config.embeddingSize },
    { label: "Layers", value: config.numLayers },
    { label: "Attention heads", value: config.numHeads },
    { label: "Feed forward size", value: config.feedForwardSize },
    { label: "Max sequence length", value: config.maxSequenceLength },
  ];
});

const trainingFields: TableField[] = [
  { key: "label", label: "Property" },
  { key: "value", label: "Value" },
];

const trainingSettings = computed(() => {
  const config = trainingConfig.value?.config;

  if (!config) {
    return [];
  }

  return [
    { label: "Optimizer", value: optimizerName(config.optimizer) },
    { label: "Learning rate", value: config.learningRate },
    { label: "Batch size", value: config.batchSize || "Auto" },
    { label: "Epochs", value: config.epochs },
    { label: "Dropout rate", value: config.dropoutRate },
    { label: "Weight decay", value: config.weightDecay },
    { label: "Max gradient norm", value: config.maxGradientNorm },
    { label: "Drop last batch", value: config.dropLast === false ? "No" : "Yes" },
  ];
});

const onEdit = () => {
  if (model.value) {
    emit("edit", model.value);
  }
};
</script>

<template>
  <BModal
    v-model="visible"
    :title="model?.name || 'Model Details'"
    size="lg"
    centered
    scrollable
  >
    <template v-if="model">
      <!-- Identity -->
      <div class="mb-3">
        <div class="d-flex align-items-center gap-2 mb-1">
          <BBadge :variant="isLoaded ? 'success' : 'secondary'">
            <i class="bi bi-circle-fill me-1"></i>
            {{ isLoaded ? "Loaded" : "Not loaded" }}
          </BBadge>

          <BBadge :variant="useQLora ? 'success' : 'secondary'">
            {{ useQLora ? "QLoRA" : "Raw" }}
          </BBadge>
        </div>

        <div class="small text-muted">
          {{ model.description || "No description." }}
        </div>

        <div class="small text-muted font-monospace mt-1">
          {{ model.entryId }}
        </div>

        <BRow class="mt-2">
          <BCol md="6">
            <div class="small text-muted">Created</div>
            <div class="small">{{ formatDate(model.dateCreated) }}</div>
          </BCol>
          <BCol md="6">
            <div class="small text-muted">Updated</div>
            <div class="small">{{ formatDate(model.dateUpdated) }}</div>
          </BCol>
        </BRow>
      </div>

      <hr />

      <!-- Model config -->
      <h6>
        <i class="bi bi-cpu me-2"></i>
        Model Configuration
      </h6>

      <div class="small text-muted mb-2">
        {{ transformerConfig?.displayName
          ? `${transformerConfig.displayName} (${transformerConfig.name})`
          : transformerConfig?.name ?? model.transformerConfigId }}
      </div>

      <BTable
        v-if="architecture.length > 0"
        :items="architecture"
        :fields="architectureFields"
        small
        bordered
      />

      <!-- Size for the mode this model was actually created with. -->
      <ModelSizeSummary
        v-if="transformerConfig"
        :config="transformerConfig.config"
        :highlight="useQLora ? 'qlora' : 'raw'"
        compact
      />

      <hr />

      <!-- Training config -->
      <h6>
        <i class="bi bi-sliders me-2"></i>
        Training Configuration
      </h6>

      <div class="small text-muted mb-2">
        {{ trainingConfig?.name ?? model.trainingConfigId }}
      </div>

      <BTable
        v-if="trainingSettings.length > 0"
        :items="trainingSettings"
        :fields="trainingFields"
        small
        bordered
      />

      <hr />

      <!-- Vocabulary -->
      <h6>
        <i class="bi bi-book me-2"></i>
        Vocabulary
      </h6>

      <div
        v-if="model.vocabulary"
        class="small"
      >
        {{ model.vocabulary.name }}
        <span class="text-muted">
          &middot; {{ model.vocabulary.numTokens }} tokens
          &middot; {{ model.vocabulary.tokenizerType }}
          <template v-if="model.vocabulary.coverage !== undefined">
            &middot; {{ Math.round(model.vocabulary.coverage * 100) }}% coverage
          </template>
        </span>
      </div>
      <div
        v-else
        class="small text-muted"
      >
        Not pinned (decided at first training).
      </div>

      <hr />

      <!-- Acceleration -->
      <h6>
        <i class="bi bi-gpu-card me-2"></i>
        Acceleration
      </h6>

      <div class="small">
        {{ model.accelerationBackend || "Auto" }}
        <BBadge
          v-if="backendInfo"
          :variant="backendInfo.available ? 'success' : 'warning'"
          class="ms-2"
        >
          {{ backendInfo.available ? "Available" : "Unavailable" }}
        </BBadge>
      </div>
      <div
        v-if="backendInfo?.description"
        class="small text-muted"
      >
        {{ backendInfo.description }}
      </div>
    </template>

    <div
      v-else
      class="text-center text-muted py-4"
    >
      Loading model details&hellip;
    </div>

    <template #modal-footer="{ cancel }">
      <BButton
        variant="secondary"
        @click="cancel()"
      >
        Close
      </BButton>

      <BButton
        variant="primary"
        :disabled="!model"
        @click="onEdit"
      >
        <i class="bi bi-pencil me-1"></i>
        Edit
      </BButton>
    </template>
  </BModal>
</template>
