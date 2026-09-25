<script lang = "ts" setup>
import {
  BContainer,
  BCard,
  BCardHeader,
  BCardBody,
  BButton,
  BTable,
  BAlert,
  BBadge,
  BSpinner,
  type TableField,
} from "bootstrap-vue-next";
import { computed, onMounted, ref } from "vue";
import transformerModelStore from "../stores/transformerModelStore";
import configStore from "../stores/configStore";
import type { TransformerModelEntry } from "../services/TransformerModelEntry";
import type { CreateTransformerModelRequest } from "../services/CreateTransformerModelRequest";
import type { AccelerationBackendInfo } from "../services/AccelerationBackendInfo";
import transformerModelService from "../services/transformerModelService";
import { useDateFormat } from "@vueuse/core";

const store = transformerModelStore();
const configs = configStore();

const availableTransformerConfigs = computed(
  () => configs.transformerConfigResponse?.transformerConfigs ?? []
);

const availableTrainingConfigs = computed(
  () => configs.trainingConfigResponse?.trainingConfigs ?? []
);

// Map config entry ids to their names so the table can show real names
// instead of raw GUIDs (the config lists are already fetched below).
const transformerConfigNameById = computed(() =>
  Object.fromEntries(
    availableTransformerConfigs.value.map((config) => [
      config.entryId,
      config.displayName ? `${config.displayName} (${config.name})` : config.name,
    ])
  )
);

const trainingConfigNameById = computed(() =>
  Object.fromEntries(
    availableTrainingConfigs.value.map((config) => [config.entryId, config.name])
  )
);

const accelerationBackends = ref<AccelerationBackendInfo[]>([]);

const getBackends = async () => {
  const response = await transformerModelService.getBackends();
  accelerationBackends.value = response?.data ?? [];
};



const showModelEditor = ref(false);

// True while a create/update request is in flight; drives the modal's
// busy state (spinner + disabled buttons) so it can't be double-submitted.
const submitting = ref(false);

// Per-row action state (load/unload) so the clicked button shows a spinner
// and row actions are locked while a request is in flight.
const loadingModelId = ref<string | null>(null);

const openModelEditor = () => {
    showModelEditor.value = true;
}

const defaultTransformerModelEntry = (): TransformerModelEntry => ({
    entryId: "",
    name: "",
    description: "",
    isLoaded: false,
    transformerConfigId: "",
    trainingConfigId: "",
    accelerationBackend: "Auto",
    useQLora: true,
    dateCreated: new Date(),
    dateUpdated: new Date(), 
});

const modelOperation = ref<"create" | "edit">("create");

const formModel = ref<TransformerModelEntry>(
    defaultTransformerModelEntry()
);

const submitModel = async () => {
    submitting.value = true;
    try {
        if (modelOperation.value === "create") {
            const request : CreateTransformerModelRequest = {
                name: formModel.value.name,
                description: formModel.value.description,
                transformerConfig: availableTransformerConfigs.value.find((c) => c.entryId === formModel.value.transformerConfigId)!,
                trainingConfig: availableTrainingConfigs.value.find((c) => c.entryId === formModel.value.trainingConfigId)!,
                accelerationBackend: formModel.value.accelerationBackend ?? "Auto",
                useQLora: formModel.value.useQLora !== false
            };
            const response = await store.createTransformerModel(request);

            if (!response) {
                notify("No response received from the backend.", "danger");
            } else if (response.statusCode !== 200) {
                //Keep the modal open so the user can correct and retry.
                notify(response.message || "Failed to create model.", "danger");
            } else {
                notify(response.message || "Model created successfully.", "success");
                showModelEditor.value = false;
            }
        } else if (modelOperation.value === "edit") {
            const request : CreateTransformerModelRequest = {
                name: formModel.value.name,
                description: formModel.value.description,
                transformerConfig: availableTransformerConfigs.value.find((c) => c.entryId === formModel.value.transformerConfigId)!,
                trainingConfig: availableTrainingConfigs.value.find((c) => c.entryId === formModel.value.trainingConfigId)!,
                accelerationBackend: formModel.value.accelerationBackend ?? "Auto",
                //Sent for shape consistency only: the backend deliberately keeps
                //the stored value, so an existing model can never be flipped.
                useQLora: formModel.value.useQLora !== false
            };
            const response = await store.updateTransformerModel(formModel.value.entryId, request);

            if (!response) {
                notify("No response received from the backend.", "danger");
            } else if (response.statusCode !== 200) {
                //Keep the modal open so the user can correct and retry.
                notify(response.message || "Failed to update model.", "danger");
            } else {
                notify(response.message || "Model updated successfully.", "success");
                showModelEditor.value = false;
            }
        }
    } finally {
        submitting.value = false;
    }
}

const availableModels = computed(
  () => store.models ?? []
);

// Transient status feedback surfaced from backend responses.
const showStatus = ref(false);
const statusMessage = ref("");
const statusVariant = ref<"success" | "danger">("success");

const notify = (message: string, variant: "success" | "danger") => {
  statusMessage.value = message;
  statusVariant.value = variant;
  showStatus.value = true;
};

onMounted(async () => {
  await store.getModels();
  await configStore().getTrainingConfigs();
  await configStore().getTransformerConfigs();
  await getBackends();
});

const viewModel = async (_modelId: string) => {
    
}

const loadModel = async (modelId: string) => {
    loadingModelId.value = modelId;
    try {
        const response = await store.loadModel(modelId);

        if (!response) {
            notify("No response received from the backend.", "danger");
        } else if (response.statusCode !== 200) {
            notify(response.message || "Failed to load model.", "danger");
        } else {
            notify(response.message || "Model loaded successfully.", "success");
        }
    } finally {
        loadingModelId.value = null;
    }
}

const unloadModel = async (modelId: string) => {
    loadingModelId.value = modelId;
    try {
        const response = await store.unloadModel(modelId);

        if (!response) {
            notify("No response received from the backend.", "danger");
        } else if (response.statusCode !== 200) {
            notify(response.message || "Failed to unload model.", "danger");
        } else {
            notify(response.message || "Model unloaded successfully.", "success");
        }
    } finally {
        loadingModelId.value = null;
    }
}

const refreshing = ref(false);

const refresh = async () => {
  refreshing.value = true;
  try {
    await store.getModels();
    await configStore().getTrainingConfigs();
    await configStore().getTransformerConfigs();
    await getBackends();
  } finally {
    refreshing.value = false;
  }
}
const modelFields: TableField[] = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "description",
    label: "Description",
  },
  {
    key: "isLoaded",
    label: "Loaded",
  },
  //Use the actual config names here, joined client-side from the config store.
  {
    key: "transformerConfigId",
    label: "Model Config",
    formatter: ({ value }) =>
      transformerConfigNameById.value[value as string] ?? (value as string),
  },
  {
    key: "trainingConfigId",
    label: "Training Config",
    formatter: ({ value }) =>
      trainingConfigNameById.value[value as string] ?? (value as string),
  },
  {
    key: "useQLora",
    label: "Training Mode",
    formatter: ({ value }) => (value === false ? "Raw" : "QLoRA"),
  },
  {
    key: "accelerationBackend",
    label: "Acceleration Backend",
    formatter: ({ value }) => (value as string) || "Auto",
  },
  {
    key: "dateCreated",
    label: "Created",
    formatter: ({ value }) => useDateFormat(value as string, "DD/MM/YYYY").value

  },
  {
    key: "dateUpdated",
    label: "Updated",
    formatter: ({ value }) => {
      if (
        value === null ||
        value === undefined ||
        value === "" ||
        Number.isNaN(new Date(value as string).getTime())
      ) {
        return "Never";
      }

      return useDateFormat(value as string, "DD/MM/YYYY").value;
    },
  },
  {
    key: "actions",
    label: "Actions",
    thClass: "text-end",
    tdClass: "text-end",
  },
];

</script>

<template>
    <BContainer fluid class="py-4">
    <BCard>
      <BCardHeader>
        <!-- Page heading -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            
            <h2 class="mb-1"><i class="bi bi-cpu"></i>Transformer Models</h2>
            <p class="text-muted mb-0">
              List of available transformer models.
            </p>
          </div>
          <BButton variant="primary" @click="openModelEditor">
            <i class="bi bi-plus me-1"></i>
            Create
          </BButton>

          <BButton
            variant="outline-secondary"
            :disabled="refreshing"
            @click="refresh"
          >
            <BSpinner
              v-if="refreshing"
              small
              class="me-1"
            />
            {{ refreshing ? "Refreshing..." : "Refresh" }}
          </BButton>
        </div>
      </BCardHeader>

      <BCardBody>
        <BAlert
          v-model="showStatus"
          :variant="statusVariant"
          dismissible
          class="mb-3"
        >
          {{ statusMessage }}
        </BAlert>

        <div class="mb-3">
          <BBadge
            variant="success"
            v-if="availableModels.find((m) => m.isLoaded)"
          >
            <i class="bi bi-circle-fill me-1"></i>
            Loaded: {{ availableModels.find((m) => m.isLoaded)?.name }}
          </BBadge>
          <BBadge variant="secondary" v-else>
            <i class="bi bi-circle-fill me-1"></i>
            No model loaded
          </BBadge>
        </div>

        <BTable
        :items="availableModels"
        :fields="modelFields"
        responsive
        striped
        hover
        bordered
        >
        <template #cell(actions)="{ item }">
            <div class="d-flex justify-content-end gap-2">
            <BButton
                variant="outline-primary"
                size="sm"
                :disabled="loadingModelId !== null"
                @click="viewModel(item.entryId)"
            >
                <i class="bi bi-eye me-1"></i>
                View
            </BButton>

            <BButton
                v-if="item.isLoaded"
                variant="outline-danger"
                size="sm"
                :disabled="loadingModelId !== null"
                @click="unloadModel(item.entryId)"
            >
                <BSpinner
                  v-if="loadingModelId === item.entryId"
                  small
                  class="me-1"
                />
                <i
                  v-else
                  class="bi bi-box-arrow-right me-1"
                ></i>
                {{ loadingModelId === item.entryId ? "Unloading..." : "Unload" }}
            </BButton>

            <BButton
                v-else
                variant="primary"
                size="sm"
                :disabled="loadingModelId !== null"
                @click="loadModel(item.entryId)"
            >
                <BSpinner
                  v-if="loadingModelId === item.entryId"
                  small
                  class="me-1"
                />
                <i
                  v-else
                  class="bi bi-box-arrow-in-right me-1"
                ></i>
                {{ loadingModelId === item.entryId ? "Loading..." : "Load" }}
            </BButton>
            </div>
        </template>

        <template #empty>
            <div class="text-center text-muted py-4">
            No transformer models have been registered.
            </div>
        </template>
        </BTable>
      </BCardBody>
    </BCard>
  </BContainer>

  <ModelEditorModal
    v-model="showModelEditor"
    v-model:model="formModel"
    :operation="modelOperation"
    :transformer-configs="availableTransformerConfigs"
    :training-configs="availableTrainingConfigs"
    :backends="accelerationBackends"
    :busy="submitting"
    @submit="submitModel"
    />

</template>