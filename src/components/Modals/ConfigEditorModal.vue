<script lang="ts" setup>
import {
  BModal,
  BForm,
  BFormGroup,
  BFormInput,
  BFormTextarea,
  BButton,
} from "bootstrap-vue-next";

import TrainingConfigForm from "../Forms/TrainingConfigForm.vue";
import TransformerConfigForm from "../Forms/TransformerConfigForm.vue";

import type { TrainingConfig } from "../../services/TrainingConfig";
import type { TransformerConfig } from "../../services/TransformerConfig";

type ConfigType = "training" | "transformer";
type ConfigOperation = "create" | "edit";

const props = defineProps<{
  configType: ConfigType;
  operation: ConfigOperation;
}>();

const modelValue = defineModel<boolean>({
  required: true,
});

const name = defineModel<string>("name", {
  required: true,
});

const description = defineModel<string>("description", {
  required: true,
});

const trainingConfig = defineModel<TrainingConfig>("trainingConfig", {
  required: true,
});

const transformerConfig = defineModel<TransformerConfig>("transformerConfig", {
  required: true,
});

const emit = defineEmits<{
  submit: [];
}>();

const modalTitle = () => {
  const action = props.operation === "create"
    ? "Create"
    : "Edit";

  const type = props.configType === "training"
    ? "Training Configuration"
    : "Model Configuration";

  return `${action} ${type}`;
};
</script>

<template>
  <BModal
    v-model="modelValue"
    :title="modalTitle()"
    centered
    @ok.prevent="emit('submit')"
  >
    <BForm
      id="config-form"
      @submit.prevent="emit('submit')"
    >

      <BFormGroup
        label="Name"
        label-for="config-name"
        class="mb-3"
      >
        <BFormInput
          id="config-name"
          v-model="name"
          placeholder="Enter configuration name"
          required
        />
      </BFormGroup>

      <BFormGroup
        label="Description"
        label-for="config-description"
        class="mb-3"
      >
        <BFormTextarea
          id="config-description"
          v-model="description"
          placeholder="Enter a description"
          rows="3"
        />
      </BFormGroup>

      <TrainingConfigForm
        v-if="configType === 'training'"
        v-model="trainingConfig"
      />

      <TransformerConfigForm
        v-if="configType === 'transformer'"
        v-model="transformerConfig"
      />

    </BForm>

    <template #modal-footer="{ cancel }">
      <BButton
        variant="secondary"
        @click="cancel()"
      >
        Cancel
      </BButton>

      <BButton
        variant="primary"
        type="submit"
        form="config-form"
      >
        {{ operation === "create" ? "Create" : "Save Changes" }}
      </BButton>
    </template>
  </BModal>
</template>