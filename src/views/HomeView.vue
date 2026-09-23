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
} from "bootstrap-vue-next";
import { onMounted, ref } from "vue";
import type { TransformerModelResponse } from "../services/TransformerModelResponse";
import transformerModelStore from "../stores/transformerModelStore";

const modelStore = transformerModelStore();

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

onMounted(async () => {
    await modelStore.getActiveModel();
    await refreshActiveModel();
});
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

            <div class="text-muted py-3">
              No active training job.
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