<script lang="ts" setup>
import {
  BModal,
  BForm,
  BFormGroup,
  BFormInput,
  BFormTextarea,
  BFormSelect,
  BButton,
} from "bootstrap-vue-next";

import type { TransformerModelEntry } from "../../services/TransformerModelEntry";
import type { TransformerConfigEntry } from "../../services/TransformerConfigEntry";
import type { TrainingConfigEntry } from "../../services/TrainingConfigEntry";

const visible = defineModel<boolean>({
  required: true,
});

const model = defineModel<TransformerModelEntry>("model", {
  required: true,
});

const props = defineProps<{
  operation: "create" | "edit";
  transformerConfigs: TransformerConfigEntry[];
  trainingConfigs: TrainingConfigEntry[];
}>();

const emit = defineEmits<{
  submit: [];
}>();

const modalTitle = () => {
  const action = props.operation === "create"
    ? "Create"
    : "Edit";

  return `${action} Model`;
};
</script>

<template>
  <BModal
    v-model="visible"
    :title="modalTitle()"
    centered
    @ok.prevent="emit('submit')"
  >
    <BForm
      id="model-form"
      @submit.prevent="emit('submit')"
    >

      <BFormGroup
        label="Name"
        label-for="model-name"
        class="mb-3"
      >
        <BFormInput
          id="model-name"
          v-model="model.name"
          placeholder="Enter model name"
          required
        />
      </BFormGroup>

      <BFormGroup
        label="Description"
        label-for="model-description"
        class="mb-3"
      >
        <BFormTextarea
          id="model-description"
          v-model="model.description"
          placeholder="Enter a description"
          rows="3"
        />
      </BFormGroup>

      <BFormGroup
        label="Model Config"
        label-for="model-config"
        class="mb-3"
      >
        <BFormSelect
          id="model-config"
          v-model="model.transformerConfigId"
          :options="props.transformerConfigs.map((config) => ({ value: config.entryId, text: config.name }))"
          required
        />
      </BFormGroup>

      <BFormGroup
        label="Training Config"
        label-for="training-config"
        class="mb-3"
      >
        <BFormSelect
          id="training-config"
          v-model="model.trainingConfigId"
          :options="props.trainingConfigs.map((config) => ({ value: config.entryId, text: config.name }))"
          required
        />
      </BFormGroup>

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
        form="model-form"
      >
        {{ operation === "create" ? "Create" : "Save Changes" }}
      </BButton>
    </template>
  </BModal>
</template>