<script lang="ts" setup>
import {
  BRow,
  BCol,
  BCard,
  BCardBody,
  BCardTitle,
  BCardText,
  BButton,
} from "bootstrap-vue-next";
</script>

<template>
  <div class="container py-5">
    <section class="text-center mb-5">
      <h1 class="display-4 fw-bold">SimpleTransformer</h1>

      <p class="lead text-muted">Train, test and interact with your transformer model.</p>
    </section>

    <BRow class="g-4">
      <BCol md="6">
        <BCard class="h-100">
          <BCardBody>
            <BCardTitle> Inference </BCardTitle>

            <BCardText>
              Send prompts to the model and inspect its predictions directly from your
              browser.
            </BCardText>

            <BButton :to="{ name: 'infer' }" variant="primary"> Open Inference </BButton>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol md="6">
        <BCard class="h-100">
          <BCardBody>
            <BCardTitle> Training </BCardTitle>

            <BCardText>
              Train the model using a file or live training data and monitor the training
              process.
            </BCardText>

            <BButton :to="{ name: 'train' }" variant="success"> Open Training </BButton>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol md="6">
        <BCard class="h-100">
          <BCardBody>
            <BCardTitle> Vocabulary Management </BCardTitle>

            <BCardText>
              Manage the vocabulary of the model and its embeddings.
            </BCardText>

            <BButton :to="{ name: 'vocab' }" variant="warning"> Open Vocabulary </BButton>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>
  </div>
</template>
