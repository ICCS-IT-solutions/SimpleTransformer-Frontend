<script lang="ts" setup>
import { computed } from "vue";
import {
  BModal,
  BForm,
  BFormGroup,
  BFormInput,
  BFormTextarea,
  BFormSelect,
  BFormCheckbox,
  BButton,
  BSpinner,
} from "bootstrap-vue-next";

import type { TransformerModelEntry } from "../../services/TransformerModelEntry";
import type { TransformerConfigEntry } from "../../services/TransformerConfigEntry";
import type { TrainingConfigEntry } from "../../services/TrainingConfigEntry";
import type { AccelerationBackendInfo } from "../../services/AccelerationBackendInfo";

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
  backends?: AccelerationBackendInfo[];
  // True while the submit request is in flight; disables the save button
  // and shows a spinner so the modal feels responsive and can't double-submit.
  busy?: boolean;
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

const backendOptions = computed(() => {
  // Auto is inserted first by the backend endpoint, but keep it guaranteed here.
  const options: { value: string; text: string; disabled?: boolean }[] = [
    { value: "Auto", text: "Auto (best available)" },
  ];

  for (const backend of props.backends ?? []) {
    if (backend.name === "Auto") {
      continue;
    }

    options.push({
      value: backend.name,
      text: backend.available ? backend.name : `${backend.name} (unavailable)`,
      disabled: !backend.available,
    });
  }

  // Make sure the currently selected backend is always selectable (e.g. when
  // editing a model whose backend was detected as unavailable at view time).
  const currentBackend = model.value.accelerationBackend ?? "Auto";
  if (!options.some((option) => option.value === currentBackend)) {
    options.push({ value: currentBackend, text: currentBackend });
  }

  return options;
});

//Training mode is structural: a QLoRA model and a raw model expose different
//trainable parameters, so a checkpoint from one can never load into the other.
//It is therefore chosen once at creation and shown read-only when editing.
const useQLora = computed({
  get: () => model.value.useQLora !== false,
  set: (value: boolean) => {
    model.value.useQLora = value;
  },
});
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
          :options="props.transformerConfigs.map((config) => ({
            value: config.entryId,
            text: config.displayName ? `${config.displayName} (${config.name})` : config.name
          }))"
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

      <BFormGroup
        label="Training Mode"
        label-for="model-use-qlora"
        class="mb-3"
      >
        <BFormCheckbox
          id="model-use-qlora"
          v-model="useQLora"
          :disabled="props.operation === 'edit'"
        >
          Quantised LoRA (QLoRA)
        </BFormCheckbox>

        <div class="form-text">
          <template v-if="useQLora">
            Frozen 4-bit base weights with small trainable LoRA adapters. Low memory
            use; recommended for this machine.
          </template>
          <template v-else>
            Raw (full fine-tuning). Every weight is a dense fp32 trainable parameter,
            so optimizer state is several times larger - pair with a small config.
          </template>
        </div>

        <div
          v-if="props.operation === 'edit'"
          class="form-text text-warning"
        >
          Training mode cannot be changed after creation. Create a new model to
          train the other way.
        </div>
      </BFormGroup>

      <BFormGroup
        label="Acceleration Backend"
        label-for="model-acceleration-backend"
        class="mb-3"
      >
        <BFormSelect
          id="model-acceleration-backend"
          v-model="model.accelerationBackend"
          :options="backendOptions"
        />
      </BFormGroup>

    </BForm>

    <template #modal-footer="{ cancel }">
      <BButton
        variant="secondary"
        :disabled="props.busy"
        @click="cancel()"
      >
        Cancel
      </BButton>

      <BButton
        variant="primary"
        type="submit"
        form="model-form"
        :disabled="props.busy"
      >
        <BSpinner
          v-if="props.busy"
          small
          class="me-1"
        />
        {{ props.busy ? "Saving..." : (operation === "create" ? "Create" : "Save Changes") }}
      </BButton>
    </template>
  </BModal>
</template>