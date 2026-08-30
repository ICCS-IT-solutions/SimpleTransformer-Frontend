<script lang="ts" setup>
import {
  BContainer,
  BCard,
  BCardBody,
  BButton,
} from "bootstrap-vue-next";
</script>

<template>
  <BContainer class="d-flex justify-content-center align-items-center min-vh-100">
    <BCard class="text-center shadow-sm" style="max-width: 600px; width: 100%;">
      <BCardBody class="p-5">

        <div class="mb-4">
          <i class="bi bi-compass display-1 text-muted"></i>
        </div>

        <div class="display-1 fw-bold mb-2">
          404
        </div>

        <h1 class="h3 mb-3">
          Page Not Found
        </h1>

        <p class="text-muted mb-4">
          The requested page doesn't exist, or this part of
          SimpleTransformer hasn't been implemented yet.
        </p>

        <div class="d-flex justify-content-center gap-2">
          <BButton
            :to="{ name: 'home' }"
            variant="primary"
          >
            <i class="bi bi-house me-1"></i>
            Dashboard
          </BButton>

          <BButton
            variant="outline-secondary"
            @click="$router.back()"
          >
            <i class="bi bi-arrow-left me-1"></i>
            Go Back
          </BButton>
        </div>

      </BCardBody>
    </BCard>
  </BContainer>
</template>