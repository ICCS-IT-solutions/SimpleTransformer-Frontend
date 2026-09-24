<script lang="ts" setup>
import {
  BContainer,
  BCard,
  BCardHeader,
  BCardBody,
  BForm,
  BFormGroup,
  BFormTextarea,
  BFormInput,
  BRow,
  BCol,
  BButton,
  BBadge,
  BFormSelect,
  BCollapse,
} from "bootstrap-vue-next";
import { computed, onMounted, ref, watch } from "vue";
import inferenceStore from "../stores/inferenceStore";
import transformerModelStore from "../stores/transformerModelStore";
import type { TrainingCheckpointEntry } from "../services/TrainingCheckpointEntry";
import configStore from "../stores/configStore";

const store = inferenceStore();
const modelStore = transformerModelStore();
const configs = configStore();

const loadedModel = computed(
  () => modelStore.models.find((m) => m.isLoaded)
);

// The config joined from the config store for the currently loaded model.
const loadedModelConfig = computed(
  () => (configs.transformerConfigResponse?.transformerConfigs ?? []).find(
    (config) => config.entryId === loadedModel.value?.transformerConfigId
  )
);

const backendLabel = computed(
  () => modelStore.activeBackend ?? loadedModel.value?.accelerationBackend ?? "Auto"
);

const vocabularyLabel = computed(() => {
  if (!loadedModelConfig.value) {
    return loadedModel.value ? "Unknown" : "Not loaded";
  }
  return `Loaded (${loadedModelConfig.value.config.vocabSize.toLocaleString()} entries)`;
});

const architectureLabel = computed(() => {
  if (!loadedModelConfig.value) {
    return "—";
  }
  const config = loadedModelConfig.value.config;
  return `${config.numLayers} layers × ${config.numHeads} heads, d=${config.embeddingSize}`;
});

const showAdvanced = ref(true);

const reset = () => {
  store.reset();
};

onMounted(async () => {
  await store.getModels();
  // Populate the shared transformer model + config stores so the
  // "currently loaded" badge and model information card stay reactive,
  // even when landing directly on this page.
  await modelStore.getModels();
  await modelStore.getActiveModel();
  await configStore().getTransformerConfigs();

  if (loadedModel.value && !store.request.transformerModelId) {
    store.request.transformerModelId = loadedModel.value.entryId;
  }
  if (store.request.transformerModelId) {
    await store.getCheckpoints(store.request.transformerModelId);
  }
});

const availableModels = computed(() =>
  (store.availableModels ?? []).map(model => ({
    value: model.entryId,
    text: model.name,
  }))
);

watch(
  () => store.request.transformerModelId,
  async (newModelId) => {
    store.request.trainingCheckpointId = null;
    if (newModelId) {
      await store.getCheckpoints(newModelId);
    } else {
      store.availableCheckpoints = [];
    }
  }
);

const checkpointOptions = computed(() => [
  { value: null, text: "None (use current model weights)" },
  ...(store.availableCheckpoints ?? []).map((checkpoint: TrainingCheckpointEntry) => ({
    value: checkpoint.entryId,
    text: `Epoch ${checkpoint.epoch} - loss ${checkpoint.loss.toFixed(4)} - ${checkpoint.filename}`,
  })),
]);

const predict = async () => {
  await store.predict(store.request);
};
</script>

<template>
  <BContainer fluid class="py-4">

    <!-- Page header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">
          <i class="bi bi-chat-square-text me-2"></i>
          Inference
        </h2>

        <p class="text-muted mb-0">
          Send a prompt to the loaded transformer model.
        </p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <BBadge variant="success" v-if="loadedModel">
          <i class="bi bi-circle-fill me-1"></i>
          {{ loadedModel?.name }}
        </BBadge>
        <BBadge variant="secondary" v-else>
          <i class="bi bi-circle-fill me-1"></i>
          No model loaded
        </BBadge>   

        <BButton
          variant="outline-secondary"
          size="sm"
          @click="reset"
        >
          <i class="bi bi-arrow-counterclockwise me-1"></i>
          Reset
        </BButton>
      </div>
    </div>


    <!-- Main inference workspace -->
    <BRow class="g-4">

      <!-- Prompt -->
      <BCol lg="7">
        <BCard class="h-100 shadow-sm">

          <BCardHeader>
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-semibold">
                <i class="bi bi-pencil-square me-2"></i>
                Prompt
              </span>

              <small class="text-muted">
                Input
              </small>
            </div>
          </BCardHeader>

          <BCardBody class="d-flex flex-column">

            <BForm @submit.prevent="predict">

              <BFormGroup
                label="Input Text"
                label-for="input-text"
                class="mb-3"
              >
                <BFormTextarea
                  id="input-text"
                  v-model="store.request.inputText"
                  rows="12"
                  placeholder="Enter a prompt for the model..."
                  class="prompt-textarea"
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
                  v-model="store.request.transformerModelId"
                  :options="availableModels"
                />
              </BFormGroup>

              <!--Checkpoint selector -->
              <BFormGroup
                label="Checkpoint"
                label-for="checkpoint-selector"
                description="Optional. Load weights from a specific training checkpoint."
                class="mb-3"
              >
                <BFormSelect
                  id="checkpoint-selector"
                  v-model="store.request.trainingCheckpointId"
                  :options="checkpointOptions"
                />
              </BFormGroup>

              <!-- Parameters -->
              <div class="border rounded p-3 mb-3">

                <div
                  class="d-flex justify-content-between align-items-center"
                  role="button"
                  @click="showAdvanced = !showAdvanced"
                >
                  <div>
                    <i class="bi bi-sliders me-2"></i>
                    <span class="fw-semibold">
                      Generation Parameters
                    </span>
                  </div>

                  <i
                    :class="[
                      'bi',
                      showAdvanced
                        ? 'bi-chevron-up'
                        : 'bi-chevron-down'
                    ]"
                  ></i>
                </div>

                <BCollapse v-model="showAdvanced">
                  <BRow class="mt-3">

                    <BCol md="6">
                      <BFormGroup
                        label="Max Tokens"
                        label-for="max-tokens"
                        class="mb-3"
                      >
                        <BFormInput
                          id="max-tokens"
                          v-model.number="
                            store.request.generationParameters.max_tokens
                          "
                          type="number"
                          min="1"
                        />
                      </BFormGroup>
                    </BCol>

                    <BCol md="6">
                      <BFormGroup
                        label="Temperature"
                        label-for="temperature"
                        class="mb-3"
                      >
                        <BFormInput
                          id="temperature"
                          v-model.number="
                            store.request.generationParameters.temperature
                          "
                          type="number"
                          min="0"
                          step="0.1"
                        />
                      </BFormGroup>
                    </BCol>

                    <BCol md="6">
                      <BFormGroup
                        label="Top P"
                        label-for="top-p"
                        class="mb-3"
                      >
                        <BFormInput
                          id="top-p"
                          v-model.number="
                            store.request.generationParameters.top_p
                          "
                          type="number"
                          min="0"
                          max="1"
                          step="0.05"
                        />
                      </BFormGroup>
                    </BCol>

                    <BCol md="6">
                      <BFormGroup
                        label="Top K"
                        label-for="top-k"
                        class="mb-3"
                      >
                        <BFormInput
                          id="top-k"
                          v-model.number="
                            store.request.generationParameters.top_k
                          "
                          type="number"
                          min="0"
                        />
                      </BFormGroup>
                    </BCol>

                    <BCol md="6">
                      <BFormGroup
                        label="Penalty"
                        label-for="penalty"
                        class="mb-0"
                      >
                        <BFormInput
                          id="penalty"
                          v-model.number="
                            store.request.generationParameters.penalty
                          "
                          type="number"
                          min="0"
                          step="0.1"
                        />
                      </BFormGroup>
                    </BCol>

                  </BRow>
                </BCollapse>

              </div>


              <!-- Generate -->
              <div class="d-flex justify-content-end">
                <BButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  :disabled="!store.request.inputText.trim()"
                >
                  <i class="bi bi-play-fill me-1"></i>
                  Generate
                </BButton>
              </div>

            </BForm>

          </BCardBody>
        </BCard>
      </BCol>


      <!-- Output -->
      <BCol lg="5">
        <BCard class="h-100 shadow-sm">

          <BCardHeader>
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-semibold">
                <i class="bi bi-terminal me-2"></i>
                Output
              </span>

              <small class="text-muted">
                Generated text
              </small>
            </div>
          </BCardHeader>

          <BCardBody>

            <div
              v-if="store.outputText"
              class="output-panel"
            >
              {{ store.outputText }}
            </div>

            <div
              v-else
              class="output-empty text-center text-muted"
            >
              <i class="bi bi-chat-square-text display-5 mb-3"></i>

              <p class="mb-0">
                Generated output will appear here.
              </p>
            </div>

          </BCardBody>
        </BCard>
      </BCol>

    </BRow>


    <!-- Model information -->
    <BRow class="g-4 mt-1">

      <BCol>
        <BCard class="shadow-sm">
          <BCardBody class="py-3">

            <div class="row text-muted small">

              <div class="col-md-4">
                <i class="bi bi-cpu me-2"></i>
                <strong>Model:</strong>
                {{ loadedModel?.name ?? "None loaded" }}
              </div>

              <div class="col-md-4">
                <i class="bi bi-lightning me-2"></i>
                <strong>Backend:</strong>
                {{ backendLabel }}
              </div>

              <div class="col-md-4">
                <i class="bi bi-book me-2"></i>
                <strong>Vocabulary:</strong>
                {{ vocabularyLabel }}
              </div>

            </div>

            <div
              v-if="loadedModelConfig"
              class="row text-muted small mt-2"
            >
              <div class="col-md-4">
                <i class="bi bi-diagram-3 me-2"></i>
                <strong>Architecture:</strong>
                {{ architectureLabel }}
              </div>

              <div class="col-md-4">
                <i class="bi bi-rulers me-2"></i>
                <strong>Max sequence:</strong>
                {{ loadedModelConfig.config.maxSequenceLength }}
              </div>

              <div class="col-md-4">
                <i class="bi bi-stack me-2"></i>
                <strong>Feed-forward:</strong>
                {{ loadedModelConfig.config.feedForwardSize }}
              </div>

            </div>

          </BCardBody>
        </BCard>
      </BCol>

    </BRow>

  </BContainer>
</template>

<style scoped>
.prompt-textarea {
  font-family: monospace;
  resize: vertical;
}

.output-panel {
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;

  padding: 1rem;

  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);

  background-color: var(--bs-tertiary-bg);

  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-word;
}

.output-empty {
  min-height: 400px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>