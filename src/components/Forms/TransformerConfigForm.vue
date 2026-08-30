<script lang="ts" setup>
import {
  BRow,
  BCol,
  BFormGroup,
  BFormInput,
} from "bootstrap-vue-next";

import type { TransformerConfig } from "../../services/TransformerConfig";

const model = defineModel<TransformerConfig>({
  required: true,
});
</script>

<template>
  <div class="mt-4">

    <h5 class="mb-3">
      <i class="bi bi-cpu me-2"></i>
      Model Architecture
    </h5>

    <BRow>
      <BCol md="6">
        <BFormGroup
          label="Vocabulary Size"
          label-for="vocab-size"
          description="Number of tokens the model can represent."
          class="mb-3"
        >
          <BFormInput
            id="vocab-size"
            v-model.number="model.vocabSize"
            type="number"
            min="1"
            step="1"
          />
        </BFormGroup>
      </BCol>

      <BCol md="6">
        <BFormGroup
          label="Maximum Sequence Length"
          label-for="max-sequence-length"
          class="mb-3"
        >
          <BFormInput
            id="max-sequence-length"
            v-model.number="model.maxSequenceLength"
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
          label="Embedding Size"
          label-for="embedding-size"
          class="mb-3"
        >
          <BFormInput
            id="embedding-size"
            v-model.number="model.embeddingSize"
            type="number"
            min="1"
            step="1"
          />
        </BFormGroup>
      </BCol>

      <BCol md="6">
        <BFormGroup
          label="Hidden Size"
          label-for="hidden-size"
          class="mb-3"
        >
          <BFormInput
            id="hidden-size"
            v-model.number="model.hiddenSize"
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
          label="Number of Layers"
          label-for="num-layers"
          class="mb-3"
        >
          <BFormInput
            id="num-layers"
            v-model.number="model.numLayers"
            type="number"
            min="1"
            step="1"
          />
        </BFormGroup>
      </BCol>

      <BCol md="6">
        <BFormGroup
          label="Number of Attention Heads"
          label-for="num-heads"
          description="Embedding size should be divisible by this value."
          class="mb-3"
        >
          <BFormInput
            id="num-heads"
            v-model.number="model.numHeads"
            type="number"
            min="1"
            step="1"
          />
        </BFormGroup>
      </BCol>
    </BRow>

    <BFormGroup
      label="Feed Forward Size"
      label-for="feed-forward-size"
      description="Size of the intermediate feed-forward network."
      class="mb-3"
    >
      <BFormInput
        id="feed-forward-size"
        v-model.number="model.feedForwardSize"
        type="number"
        min="1"
        step="1"
      />
    </BFormGroup>

  </div>
</template>