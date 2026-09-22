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
    availableTransformerConfigs.value.map((config) => [config.entryId, config.name])
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
    dateCreated: new Date(),
    dateUpdated: new Date(), 
});

const modelOperation = ref<"create" | "edit">("create");

const formModel = ref<TransformerModelEntry>(
    defaultTransformerModelEntry()
);

const submitModel = async () => {
    if (modelOperation.value === "create") {
        const request : CreateTransformerModelRequest = {
            name: formModel.value.name,
            description: formModel.value.description,
            transformerConfig: availableTransformerConfigs.value.find((c) => c.entryId === formModel.value.transformerConfigId)!,
            trainingConfig: availableTrainingConfigs.value.find((c) => c.entryId === formModel.value.trainingConfigId)!,
            accelerationBackend: formModel.value.accelerationBackend ?? "Auto"
        };
        const response = await store.createTransformerModel(request);

        if (!response) {
            notify("No response received from the backend.", "danger");
        } else if (response.statusCode !== 200) {
            notify(response.message || "Failed to create model.", "danger");
        } else {
            notify(response.message || "Model created successfully.", "success");
        }
    } else if (modelOperation.value === "edit") {
        const request : CreateTransformerModelRequest = {
            name: formModel.value.name,
            description: formModel.value.description,
            transformerConfig: availableTransformerConfigs.value.find((c) => c.entryId === formModel.value.transformerConfigId)!,
            trainingConfig: availableTrainingConfigs.value.find((c) => c.entryId === formModel.value.trainingConfigId)!,
            accelerationBackend: formModel.value.accelerationBackend ?? "Auto"
        };
        const response = await store.updateTransformerModel(request);

        if (!response) {
            notify("No response received from the backend.", "danger");
        } else if (response.statusCode !== 200) {
            notify(response.message || "Failed to update model.", "danger");
        } else {
            notify(response.message || "Model updated successfully.", "success");
        }
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
    const response = await store.loadModel(modelId);

    if (!response) {
        notify("No response received from the backend.", "danger");
    } else if (response.statusCode !== 200) {
        notify(response.message || "Failed to load model.", "danger");
    } else {
        notify(response.message || "Model loaded successfully.", "success");
    }
}

const refresh = async () => {
  await store.getModels();
    await configStore().getTrainingConfigs();
  await configStore().getTransformerConfigs();
  await getBackends();
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
            @click="refresh"
          >
            Refresh
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
                @click="viewModel(item.entryId)"
            >
                <i class="bi bi-eye me-1"></i>
                View
            </BButton>

            <BButton
                variant="primary"
                size="sm"
                :disabled="item.isLoaded"
                @click="loadModel(item.entryId)"
            >
                <i class="bi bi-box-arrow-in-right me-1"></i>
                {{ item.isLoaded ? "Loaded" : "Load" }}
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
    @submit="submitModel"
    />

</template>