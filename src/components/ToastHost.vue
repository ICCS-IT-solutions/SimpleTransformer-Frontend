<script setup lang="ts">
import { useToast } from "bootstrap-vue-next";
import { registerToastRegistrar, TOAST_DURATION_MS } from "../services/toastService";

//useToast() has to run in a child of the BApp that App.vue mounts (it relies on
//the orchestrator registry BApp provides), and axios interceptors run outside of
//any component setup, so the creator is captured here and handed to the service.
const { create } = useToast();

registerToastRegistrar(({ title, body, variant }) => {
  const controller = create({
    title,
    body,
    variant,
    //A numeric modelValue shows the toast and dismisses it after the countdown.
    modelValue: TOAST_DURATION_MS,
    position: "top-end",
  });

  //Created toasts persist in the orchestrator store until disposed, so destroy
  //each one once it has hidden (either by countdown or by the close button).
  controller
    .show()
    .then(() => controller.destroy())
    .catch(() => { /* dismissed before it could resolve */ });
});
</script>

<template>
  <!-- Renders nothing: BApp already mounts the toast orchestrator. -->
</template>
