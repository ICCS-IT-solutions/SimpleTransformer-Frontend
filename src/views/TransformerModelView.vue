<script lang = "ts" setup>
import {
  BContainer,
  BCard,
  BCardHeader,
  BCardBody,
  BButton,
  BTable,
  type TableField,
} from "bootstrap-vue-next";
import { computed, onMounted, ref } from "vue";
import transformerModelStore from "../stores/transformerModelStore";
import configStore from "../stores/configStore";
import type { TransformerModelEntry } from "../services/TransformerModelEntry";
import type { CreateTransformerModelRequest } from "../services/CreateTransformerModelRequest";

const store = transformerModelStore();
const configs = configStore();

const availableTransformerConfigs = computed(
  () => configs.transformerConfigResponse?.transformerConfigs ?? []
);

const availableTrainingConfigs = computed(
  () => configs.trainingConfigResponse?.trainingConfigs ?? []
);

const showModelEditor = ref(false);

const openModelEditor = () => {
    showModelEditor.value = true;
}

const defaultTransformerModelEntry = (): TransformerModelEntry => ({
    entryId: "",
    name: "",
    description: "",
    transformerConfigId: "",
    trainingConfigId: "",
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
            trainingConfig: availableTrainingConfigs.value.find((c) => c.entryId === formModel.value.trainingConfigId)!
        };
        await store.createTransformerModel(request);
    } else if (modelOperation.value === "edit") {
        const request : CreateTransformerModelRequest = {
            name: formModel.value.name,
            description: formModel.value.description,
            transformerConfig: availableTransformerConfigs.value.find((c) => c.entryId === formModel.value.transformerConfigId)!,
            trainingConfig: availableTrainingConfigs.value.find((c) => c.entryId === formModel.value.trainingConfigId)!
        };
        await store.updateTransformerModel(request);
    }
}

const availableModels = computed(
  () => store.models ?? []
);

onMounted(async () => {
  await store.getModels();
  await configStore().getTrainingConfigs();
  await configStore().getTransformerConfigs();
});

const viewModel = async (modelId: string) => {
    
}

const loadModel = async (modelId: string) => {
    
}

const refresh = async () => {
  await store.getModels();
    await configStore().getTrainingConfigs();
  await configStore().getTransformerConfigs();
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
    key: "transformerConfigId",
    label: "Model Config",
  },
  {
    key: "trainingConfigId",
    label: "Training Config",
  },
  {
    key: "dateCreated",
    label: "Created",
    formatter: (value: any) => new Date(value).toLocaleString(),
  },
  {
    key: "dateUpdated",
    label: "Updated",
    formatter: (value: any) =>
      value ? new Date(value).toLocaleString() : "Never",
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
                @click="loadModel(item.entryId)"
            >
                <i class="bi bi-box-arrow-in-right me-1"></i>
                Load
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
    @submit="submitModel"
    />

</template>