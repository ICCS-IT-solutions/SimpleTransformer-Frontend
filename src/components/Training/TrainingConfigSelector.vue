<script lang="ts" setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import {
  BCard,
  BCardHeader,
  BCardBody,
  BCardTitle,
  BFormGroup,
  BFormSelect,
  BTable,
  BBadge,
  BAlert,
  type TableField,
} from "bootstrap-vue-next";

import type { TrainingConfig } from "../../services/TrainingConfig";
import { OptimizerType } from "../../services/OptimizerType";

export type TrainingConfigPreset = {
  label: string;
  value: string;
  description: string;
  config: TrainingConfig;
};

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: TrainingConfigPreset[];
    /** RBAC seam: when false, the "Manage in Configuration" link is hidden. Selection stays read-only either way. */
    canEdit?: boolean;
    disabled?: boolean;
  }>(),
  {
    canEdit: false,
    disabled: false,
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const selectedPreset = computed(
  () => props.options.find((option) => option.value === props.modelValue) ?? null
);

const isSgd = computed(
  () => selectedPreset.value?.config.optimizer === OptimizerType.Sgd
);

const optimizerLabel = computed(() => (isSgd.value ? "SGD" : "AdamW"));
const optimizerBadgeVariant = computed(() =>
  isSgd.value ? "info" : "primary"
);

type DetailRow = { label: string; value: string };

const formatNumber = (value: unknown): string => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return String(value);
};

const formatBoolean = (value: unknown): string => {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "—";
};

const detailRows = computed<DetailRow[]>(() => {
  const config = selectedPreset.value?.config;
  if (!config) return [];

  const rows: DetailRow[] = [
    { label: "Optimizer", value: optimizerLabel.value },
    { label: "Learning rate", value: formatNumber(config.learningRate) },
    { label: "Batch size", value: formatNumber(config.batchSize) },
    { label: "Epochs", value: formatNumber(config.epochs) },
    { label: "Dropout rate", value: formatNumber(config.dropoutRate) },
    { label: "Weight decay", value: formatNumber(config.weightDecay) },
    { label: "Max gradient norm", value: formatNumber(config.maxGradientNorm) },
    { label: "Warmup steps", value: formatNumber(config.warmupSteps) },
    { label: "Min learning rate", value: formatNumber(config.minLearningRate) },
    { label: "Drop last partial batch", value: formatBoolean(config.dropLast) },
  ];

  if (isSgd.value) {
    rows.push(
      { label: "Momentum", value: formatNumber(config.sgdMomentum) },
      { label: "Nesterov momentum", value: formatBoolean(config.useNesterov) }
    );
  } else {
    rows.push(
      { label: "Beta 1", value: formatNumber(config.beta1) },
      { label: "Beta 2", value: formatNumber(config.beta2) },
      { label: "Epsilon", value: formatNumber(config.epsilon) }
    );
  }

  return rows;
});

const detailFields: TableField<DetailRow>[] = [
  { key: "label", label: "Setting", thClass: "w-50" },
  { key: "value", label: "Value" },
];

const onSelect = (value: string | string[] | null) =>
  emit("update:modelValue", typeof value === "string" ? value : "");

// BFormSelect expects { value, text } option objects; presets carry richer data.
const selectOptions = computed(() =>
  props.options.map((option) => ({ value: option.value, text: option.label }))
);
</script>

<template>
  <BCard>
    <BCardHeader>
      <BCardTitle class="mb-0">
        Training configuration
      </BCardTitle>
    </BCardHeader>

    <BCardBody>
      <BFormGroup
        label="Selected configuration"
        label-for="training-config-selector"
        description="Shared by live and file training. Editing happens under Configuration Management."
        class="mb-3"
      >
        <BFormSelect
          id="training-config-selector"
          :model-value="modelValue"
          :options="selectOptions"
          :disabled="disabled || options.length === 0"
          @update:model-value="onSelect"
        />
      </BFormGroup>

      <div v-if="selectedPreset">
        <div class="d-flex align-items-center gap-2 mb-1">
          <h5 class="mb-0">
            {{ selectedPreset.label }}
          </h5>
          <BBadge :variant="optimizerBadgeVariant">
            {{ optimizerLabel }}
          </BBadge>
        </div>

        <p class="text-muted">
          {{ selectedPreset.description }}
        </p>

        <BTable
          :items="detailRows"
          :fields="detailFields"
          small
          bordered
          striped
          class="mb-2"
        />

        <small v-if="canEdit" class="text-muted">
          <RouterLink :to="{ name: 'config' }">
            Manage in Configuration…
          </RouterLink>
        </small>
      </div>

      <BAlert v-else variant="warning" show class="mb-0">
        No training configuration selected.
      </BAlert>
    </BCardBody>
  </BCard>
</template>
