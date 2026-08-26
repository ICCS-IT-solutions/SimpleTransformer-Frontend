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
} from "bootstrap-vue-next";
import inferenceStore from "../stores/inferenceStore";

const store = inferenceStore();

const reset = () => {
  store.reset();
};

const predict = async () => {
  await store.predict(store.request);
  if (store.outputText) {
    console.log(store.outputText);
  }
};
</script>

<template>
  <BContainer fluid class="py-4">
    <BCard>
      <!-- Header -->
      <BCardHeader>
        <div class="d-flex justify-content-between align-items-center">
          <h3 class="mb-0">Inference</h3>

          <BButton variant="outline-secondary" size="sm" @click="reset"> Reset </BButton>
        </div>
      </BCardHeader>

      <!-- Form -->
      <BCardBody>
        <BRow>
          <!-- Input / parameters -->
          <BCol lg="6" class="mb-4 mb-lg-0">
            <BForm @submit.prevent="predict">
              <!-- Input -->
              <BFormGroup label="Input Text" label-for="input-text" class="mb-4">
                <BFormTextarea
                  id="input-text"
                  v-model="store.request.inputText"
                  rows="6"
                  placeholder="Enter text for the model..."
                />
              </BFormGroup>

              <!-- Generation parameters -->
              <h5 class="mb-3">Generation Parameters</h5>

              <BRow>
                <!-- Max Tokens -->
                <BCol md="6">
                  <BFormGroup label="Max Tokens" label-for="max-tokens" class="mb-3">
                    <BFormInput
                      id="max-tokens"
                      v-model.number="store.request.generationParameters.max_tokens"
                      type="number"
                      min="1"
                    />
                  </BFormGroup>
                </BCol>

                <!-- Temperature -->
                <BCol md="6">
                  <BFormGroup label="Temperature" label-for="temperature" class="mb-3">
                    <BFormInput
                      id="temperature"
                      v-model.number="store.request.generationParameters.temperature"
                      type="number"
                      min="0"
                      step="0.1"
                    />
                  </BFormGroup>
                </BCol>

                <!-- Top P -->
                <BCol md="6">
                  <BFormGroup label="Top P" label-for="top-p" class="mb-3">
                    <BFormInput
                      id="top-p"
                      v-model.number="store.request.generationParameters.top_p"
                      type="number"
                      min="0"
                      max="1"
                      step="0.05"
                    />
                  </BFormGroup>
                </BCol>

                <!-- Top K -->
                <BCol md="6">
                  <BFormGroup label="Top K" label-for="top-k" class="mb-3">
                    <BFormInput
                      id="top-k"
                      v-model.number="store.request.generationParameters.top_k"
                      type="number"
                      min="0"
                    />
                  </BFormGroup>
                </BCol>

                <!-- Penalty -->
                <BCol md="6">
                  <BFormGroup label="Penalty" label-for="penalty" class="mb-3">
                    <BFormInput
                      id="penalty"
                      v-model.number="store.request.generationParameters.penalty"
                      type="number"
                      min="0"
                      step="0.1"
                    />
                  </BFormGroup>
                </BCol>
              </BRow>

              <!-- Actions -->
              <div class="d-flex justify-content-end gap-2 mt-3">
                <BButton type="button" variant="secondary" @click="reset">
                  Reset
                </BButton>

                <BButton type="submit" variant="primary"> Predict </BButton>
              </div>
            </BForm>
          </BCol>

          <!-- Output -->
          <BCol lg="6">
            <h5 class="mb-3">Output</h5>

            <BCard bg-variant="light" class="h-100">
              <BCardBody>
                <pre class="mb-0">{{ store.outputText }}</pre>
              </BCardBody>
            </BCard>
          </BCol>
        </BRow>
      </BCardBody>
    </BCard>
  </BContainer>
</template>
