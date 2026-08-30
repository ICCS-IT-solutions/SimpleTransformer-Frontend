<script lang="ts" setup>
import {
  BRow,
  BCol,
  BFormGroup,
  BFormInput,
  BFormSelect,
  BFormCheckbox,
} from "bootstrap-vue-next";

import type { TrainingConfig } from "../../services/TrainingConfig";
import { OptimizerType } from "../../services/OptimizerType";

const model = defineModel<TrainingConfig>({
  required: true,
});

const optimizerOptions = [
  {
    value: OptimizerType.AdamW,
    text: "AdamW",
  },
  {
    value: OptimizerType.Sgd,
    text: "SGD",
  },
];
</script>

<template>
  <div class="mt-4">

    <h5 class="mb-3">
      <i class="bi bi-sliders me-2"></i>
      Optimization
    </h5>

    <BRow>
      <BCol md="6">
        <BFormGroup
          label="Optimizer"
          label-for="optimizer"
          class="mb-3"
        >
          <BFormSelect
            id="optimizer"
            v-model="model.optimizer"
            :options="optimizerOptions"
          />
        </BFormGroup>
      </BCol>

      <BCol md="6">
        <BFormGroup
          label="Learning Rate"
          label-for="learning-rate"
          class="mb-3"
        >
          <BFormInput
            id="learning-rate"
            v-model.number="model.learningRate"
            type="number"
            step="0.000001"
            min="0"
          />
        </BFormGroup>
      </BCol>
    </BRow>

    <BRow>
      <BCol md="6">
        <BFormGroup
          label="Batch Size"
          label-for="batch-size"
          class="mb-3"
        >
          <BFormInput
            id="batch-size"
            v-model.number="model.batchSize"
            type="number"
            min="1"
            step="1"
          />
        </BFormGroup>
      </BCol>

      <BCol md="6">
        <BFormGroup
          label="Epochs"
          label-for="epochs"
          class="mb-3"
        >
          <BFormInput
            id="epochs"
            v-model.number="model.epochs"
            type="number"
            min="1"
            step="1"
          />
        </BFormGroup>
      </BCol>
    </BRow>

    <BRow>
      <BCol md="6">
        <BFormGroup
          label="Dropout Rate"
          label-for="dropout-rate"
          description="Normally between 0 and 1."
          class="mb-3"
        >
          <BFormInput
            id="dropout-rate"
            v-model.number="model.dropoutRate"
            type="number"
            min="0"
            max="1"
            step="0.01"
          />
        </BFormGroup>
      </BCol>

      <BCol md="6">
        <BFormGroup
          label="Weight Decay"
          label-for="weight-decay"
          class="mb-3"
        >
          <BFormInput
            id="weight-decay"
            v-model.number="model.weightDecay"
            type="number"
            min="0"
            step="0.0001"
          />
        </BFormGroup>
      </BCol>
    </BRow>

    <h5 class="mb-3 mt-3">
      <i class="bi bi-graph-up me-2"></i>
      Gradient & Optimizer Settings
    </h5>

    <BRow>
      <BCol md="6">
        <BFormGroup
          label="Max Gradient Norm"
          label-for="max-gradient-norm"
          class="mb-3"
        >
          <BFormInput
            id="max-gradient-norm"
            v-model.number="model.maxGradientNorm"
            type="number"
            min="0"
            step="0.1"
          />
        </BFormGroup>
      </BCol>

      <BCol md="6">
        <BFormGroup
          label="Epsilon"
          label-for="epsilon"
          class="mb-3"
        >
          <BFormInput
            id="epsilon"
            v-model.number="model.epsilon"
            type="number"
            min="0"
            step="0.000000001"
          />
        </BFormGroup>
      </BCol>
    </BRow>

    <!-- AdamW -->

    <div v-if="model.optimizer === OptimizerType.AdamW">

      <h6 class="mb-3 mt-2">
        AdamW Parameters
      </h6>

      <BRow>
        <BCol md="6">
          <BFormGroup
            label="Beta 1"
            label-for="beta1"
            class="mb-3"
          >
            <BFormInput
              id="beta1"
              v-model.number="model.beta1"
              type="number"
              min="0"
              max="1"
              step="0.001"
            />
          </BFormGroup>
        </BCol>

        <BCol md="6">
          <BFormGroup
            label="Beta 2"
            label-for="beta2"
            class="mb-3"
          >
            <BFormInput
              id="beta2"
              v-model.number="model.beta2"
              type="number"
              min="0"
              max="1"
              step="0.001"
            />
          </BFormGroup>
        </BCol>
      </BRow>

    </div>

    <!-- SGD -->

    <div v-if="model.optimizer === OptimizerType.Sgd">

      <h6 class="mb-3 mt-2">
        SGD Parameters
      </h6>

      <BRow>
        <BCol md="6">
          <BFormGroup
            label="Momentum"
            label-for="sgd-momentum"
            class="mb-3"
          >
            <BFormInput
              id="sgd-momentum"
              v-model.number="model.sgdMomentum"
              type="number"
              min="0"
              max="1"
              step="0.01"
            />
          </BFormGroup>
        </BCol>

        <BCol md="6" class="d-flex align-items-center">
          <BFormCheckbox
            v-model="model.useNesterov"
          >
            Use Nesterov Momentum
          </BFormCheckbox>
        </BCol>
      </BRow>

    </div>

    <h5 class="mb-3 mt-3">
      <i class="bi bi-clock-history me-2"></i>
      Learning Rate Schedule
    </h5>

    <BRow>
      <BCol md="6">
        <BFormGroup
          label="Warmup Steps"
          label-for="warmup-steps"
          class="mb-3"
        >
          <BFormInput
            id="warmup-steps"
            v-model.number="model.warmupSteps"
            type="number"
            min="0"
            step="1"
          />
        </BFormGroup>
      </BCol>

      <BCol md="6">
        <BFormGroup
          label="Minimum Learning Rate"
          label-for="min-learning-rate"
          class="mb-3"
        >
          <BFormInput
            id="min-learning-rate"
            v-model.number="model.minLearningRate"
            type="number"
            min="0"
            step="0.000001"
          />
        </BFormGroup>
      </BCol>
    </BRow>

  </div>
</template>