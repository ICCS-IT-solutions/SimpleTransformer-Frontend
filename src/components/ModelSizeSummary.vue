<script lang="ts" setup>
import { computed } from "vue";
import { BAlert, BBadge, BTable, type TableField } from "bootstrap-vue-next";

import type { TransformerConfig } from "../services/TransformerConfig";
import {
  estimateTransformerSizes,
  formatBytes,
  formatParameterCount,
  type TransformerSizeMode,
} from "../services/transformerSizeEstimate";

const props = defineProps<{
  config: TransformerConfig;
  // Emphasises one row, e.g. the mode a model was actually created with.
  // Omit to show both modes as a straight comparison (config-time hint).
  highlight?: TransformerSizeMode;
  // Hides the per-component breakdown table for tighter layouts.
  compact?: boolean;
}>();

// Recomputed on every keystroke in the bound form, so the hint stays live.
const estimate = computed(() => estimateTransformerSizes(props.config));

const rows = computed(() => {
  if (!estimate.value.isValid) {
    return [];
  }

  return [
    {
      mode: "raw",
      label: "Raw (full fine-tuning)",
      breakdown: estimate.value.raw,
    },
    {
      mode: "qlora",
      label: `QLoRA (rank ${estimate.value.loraRank})`,
      breakdown: estimate.value.qlora,
    },
  ];
});

const sizeFields: TableField[] = [
  { key: "label", label: "Training mode" },
  { key: "parameters", label: "Trainable parameters" },
  { key: "weights", label: "Weights (fp32)" },
  { key: "state", label: "Training state" },
];

// How much of the QLoRA figure is the token embedding table, which stays a
// dense trainable tensor in both modes and so caps the saving.
const embeddingShare = computed(() => {
  if (!estimate.value.isValid) {
    return 0;
  }

  return estimate.value.qlora.embeddingParameters / estimate.value.qlora.trainableParameters;
});

const savings = computed(() => {
  if (!estimate.value.isValid || estimate.value.raw.trainableParameters <= 0) {
    return 0;
  }

  return 1 - (estimate.value.qlora.trainableParameters / estimate.value.raw.trainableParameters);
});

// Below roughly rank 10-20 the adapters are not actually smaller than the
// dense layers they replace, so QLoRA costs *more* on tiny architectures.
const qloraIsLarger = computed(() => savings.value < 0);
</script>

<template>
  <div class="mt-4">
    <h5 class="mb-3">
      <i class="bi bi-calculator me-2"></i>
      Estimated Size
    </h5>

    <BAlert
      v-if="!estimate.isValid"
      variant="info"
      class="mb-0"
    >
      Enter an architecture above to see how many parameters the model will
      train, and how much smaller it is when created in QLoRA mode.
    </BAlert>

    <template v-else>
      <BAlert
        v-if="!estimate.isDivisible"
        variant="warning"
      >
        <i class="bi bi-exclamation-triangle me-1"></i>
        Embedding size must be divisible by the number of attention heads.
        The backend rejects this configuration.
      </BAlert>

      <p class="text-muted small">
        Trainable parameter counts for this architecture, assuming the AdamW
        optimizer (weights + gradients + 2 moments = 16 bytes per parameter).
      </p>

      <BTable
        :items="rows"
        :fields="sizeFields"
        small
        bordered
        class="align-middle"
      >
        <template #cell(label)="{ item }">
          <div class="d-flex align-items-center gap-2">
            <BBadge
              :variant="item.mode === 'qlora' ? 'success' : 'secondary'"
            >
              {{ item.mode === "qlora" ? "QLoRA" : "Raw" }}
            </BBadge>

            <span>{{ item.label }}</span>

            <BBadge
              v-if="highlight === item.mode"
              variant="info"
            >
              In use
            </BBadge>
          </div>
        </template>

        <template #cell(parameters)="{ item }">
          <span class="fw-semibold">
            {{ formatParameterCount(item.breakdown.trainableParameters) }}
          </span>
        </template>

        <template #cell(weights)="{ item }">
          {{ formatBytes(item.breakdown.trainableBytes) }}
        </template>

        <template #cell(state)="{ item }">
          {{ formatBytes(item.breakdown.trainingStateBytes) }}
        </template>
      </BTable>

      <!-- QLoRA is not automatically cheaper: on small architectures the
           adapters outweigh the dense layers they stand in for. -->
      <BAlert
        v-if="qloraIsLarger"
        variant="warning"
        class="mb-3"
      >
        <i class="bi bi-exclamation-triangle me-1"></i>
        At this size the LoRA adapters are
        {{ Math.abs(Math.round(savings * 100)) }}% <em>larger</em> than the
        weights they replace, so QLoRA trains more parameters than raw
        ({{ formatBytes(estimate.qlora.trainingStateBytes) }} instead of
        {{ formatBytes(estimate.raw.trainingStateBytes) }}). QLoRA only pays off
        once the embedding and feed-forward matrices are large; use a raw model
        at this scale.
      </BAlert>

      <BAlert
        v-else
        variant="success"
        class="mb-3"
      >
        <i class="bi bi-lightning-charge me-1"></i>
        QLoRA trains {{ Math.round(savings * 100) }}% fewer parameters
        ({{ formatBytes(estimate.qlora.trainingStateBytes) }} of training state
        instead of {{ formatBytes(estimate.raw.trainingStateBytes) }}).
        <template v-if="highlight === undefined">
          The training mode is chosen when a model is created, not here.
        </template>
      </BAlert>

      <template v-if="!compact">
        <div class="small text-muted">
          Under QLoRA the dense base weights are frozen in 4-bit
          ({{ formatBytes(estimate.qloraBaseWeightBytes) }} held in memory but
          never updated), while the token embedding table stays dense and
          trainable. It accounts for
          {{ Math.round(embeddingShare * 100) }}% of the QLoRA trainable
          parameters, so the saving narrows as the vocabulary grows.
        </div>

        <div class="small text-muted mt-1">
          The sinusoidal position buffer
          ({{ formatBytes(estimate.positionalBufferBytes) }}) is a fixed lookup
          table, not a trainable parameter, and is excluded from both figures.
        </div>
      </template>
    </template>
  </div>
</template>
