```vue
<script lang="ts" setup>
import {
  BContainer,
  BCard,
  BCardHeader,
  BCardBody,
  BRow,
  BCol,
  BButton,
  BTabs,
  BTab,
  BTable, 
  type TableField,
} from "bootstrap-vue-next";
import { computed, onMounted, ref } from "vue";
import configStore from "../stores/configStore";
import { OptimizerType } from "../services/OptimizerType";
import type { TrainingConfig } from "../services/TrainingConfig";
import type { TransformerConfig } from "../services/TransformerConfig";
import type { UpdateTransformerConfigRequest } from "../services/UpdateTransformerConfigRequest";
import type { UpdateTrainingConfigRequest } from "../services/UpdateTrainingConfigRequest";
import type { CreateTransformerConfigRequest } from "../services/CreateTransformerConfigRequest";
import type { CreateTrainingConfigRequest } from "../services/CreateTrainingConfigRequest";
import ConfigEditorModal from "../components/Modals/ConfigEditorModal.vue";

const store = configStore();

const defaultTransformerConfig = (): TransformerConfig => ({
  vocabSize: 5000,
  embeddingSize: 256,
  numLayers: 6,
  numHeads: 8,
  hiddenSize: 256,
  feedForwardSize: 1024,
  maxSequenceLength: 512,
});

const defaultTrainingConfig = (): TrainingConfig => ({
  optimizer: OptimizerType.AdamW,
  learningRate: 0.001,
  batchSize: 8,
  epochs: 10,
  dropoutRate: 0.1,
  weightDecay: 0.01,
  maxGradientNorm: 1.0,
  beta1: 0.9,
  beta2: 0.999,
  epsilon: 0.00000001,
  sgdMomentum: 0.9,
  useNesterov: true,
  warmupSteps: 0,
  minLearningRate: 0,
});

const trainingConfigs = computed(
  () => store.trainingConfigResponse?.trainingConfigs ?? []
);

const transformerConfigs = computed(
  () => store.transformerConfigResponse?.transformerConfigs ?? []
);

type ConfigType = "training" | "transformer";
type ConfigOperation = "create" | "edit";

const configOperation = ref<ConfigOperation>("create");
const editingConfigId = ref<string | null>(null);

const showCreateConfigModal = ref(false);
const createConfigType= ref<ConfigType>("training");

const formName = ref("");
const formDescription = ref("");

const getConfigs = async () => {
  return await Promise.all([
    store.getTrainingConfigs(),
    store.getTransformerConfigs(),
  ]);
};

const formTrainingConfig = ref<TrainingConfig>(
  defaultTrainingConfig()
);

const formTransformerConfig = ref<TransformerConfig>(
  defaultTransformerConfig()
);

const openCreateModal = (type: ConfigType) => {
  configOperation.value = "create";
  createConfigType.value = type;
  editingConfigId.value = null;

  formName.value = "";
  formDescription.value = "";

  if (type === "training") {
    formTrainingConfig.value = defaultTrainingConfig();
  } else {
    formTransformerConfig.value = defaultTransformerConfig();
  }

  showCreateConfigModal.value = true;
};

const createTransformerConfig = async () => {
  openCreateModal("transformer");
};

const createTrainingConfig = async () => {
  openCreateModal("training");
};

const editTrainingConfig = async (configId: string) => {
  await store.getTrainingConfig(configId);

  const config = store.trainingConfigResponse?.trainingConfig;

  if (!config) {
    return;
  }

  createConfigType.value = "training";
  configOperation.value = "edit";
  editingConfigId.value = config.entryId;

  formName.value = config.name;
  formDescription.value = config.description;

  formTrainingConfig.value = {
    ...config.config
  };

  showCreateConfigModal.value = true;
};

const editTransformerConfig = async (configId: string) => {
  await store.getTransformerConfig(configId);

  const config = store.transformerConfigResponse?.transformerConfig;

  if (!config) {
    return;
  }

  createConfigType.value = "transformer";
  configOperation.value = "edit";
  editingConfigId.value = config.entryId;

  formName.value = config.name;
  formDescription.value = config.description;

  formTransformerConfig.value = {
    ...config.config
  };

  showCreateConfigModal.value = true;
};
const submitConfig = async () => {
  if (!formName.value.trim()) {
    return;
  }

  if (createConfigType.value === "training") {
    const request = {
      name: formName.value.trim(),
      description: formDescription.value.trim(),
      config: { ...formTrainingConfig.value } // Fixed: formTrainingConfig instead of trainingConfig
    };

    if (configOperation.value === "create") {
      await store.createTrainingConfig(request as CreateTrainingConfigRequest);
    } else if (configOperation.value === "edit") {
      const editConfigRequest = request as UpdateTrainingConfigRequest;
      editConfigRequest.configId = editingConfigId.value as string;
      await store.updateTrainingConfig(editConfigRequest);
    }

    await store.getTrainingConfigs();
  } else {
    const request = {
      name: formName.value.trim(),
      description: formDescription.value.trim(),
      config: { ...formTransformerConfig.value } // Fixed: formTransformerConfig instead of transformerConfig
    };

    if (configOperation.value === "create") {
      await store.createTransformerConfig(request as CreateTransformerConfigRequest);
    } else if (configOperation.value === "edit") {
      const editConfigRequest = request as UpdateTransformerConfigRequest;
      editConfigRequest.configId = editingConfigId.value as string;
      await store.updateTransformerConfig(editConfigRequest);
    }

    await store.getTransformerConfigs();
  }

  showCreateConfigModal.value = false;
};


const trainingConfigFields: TableField[] = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "description",
    label: "Description",
  },
  {
    key: "actions",
    label: "Actions",
    thClass: "text-end",
    tdClass: "text-end",
  },
];

const transformerConfigFields: TableField[] = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "description",
    label: "Description",
  },
  {
    key: "actions",
    label: "Actions",
    thClass: "text-end",
    tdClass: "text-end",
  },
];

onMounted(async () => {
  await getConfigs();
});
</script>

<template>
  <BContainer fluid class="py-4">
    <!-- Page header -->
    <BCard class="mb-4">
      <BCardHeader>
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h3 class="mb-1">
              <i class="bi bi-gear me-2"></i>
              Configuration Management
            </h3>

            <p class="text-muted mb-0">
              Create and manage training and transformer configurations.
            </p>
          </div>

          <BButton
            variant="outline-secondary"
            size="sm"
            @click="getConfigs"
          >
            <i class="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </BButton>
        </div>
      </BCardHeader>
    </BCard>

    <BCard>
      <BCardBody>
        <BTabs>
          <!-- Training configurations -->
          <BTab title="Training Configs">
            <BRow class="align-items-center mb-3">
              <BCol>
                <h4 class="mb-1">Training Configurations</h4>
                <p class="text-muted mb-0">
                  Configure optimization and training behaviour.
                </p>
              </BCol>

              <BCol cols="auto">
                <BButton
                  variant="primary"
                  @click="createTrainingConfig"
                >
                  <i class="bi bi-plus me-1"></i>
                  Create Training Config
                </BButton>
              </BCol>
            </BRow>

            <BTable
              :items="trainingConfigs"
              :fields="trainingConfigFields"
              responsive
              striped
              hover
              bordered
            >
              <template #cell(actions)="{ item }">
                <BButton
                  variant="outline-primary"
                  size="sm"
                  @click="editTrainingConfig(item.entryId)"
                >
                  <i class="bi bi-pencil me-1"></i>
                  Edit
                </BButton>
              </template>

              <template #empty>
                <div class="text-center text-muted py-3">
                  No training configurations found.
                </div>
              </template>
            </BTable>
          </BTab>

          <!-- Transformer configurations -->
          <BTab title="Model Configs">
            <BRow class="align-items-center mb-3">
              <BCol>
                <h4 class="mb-1">Model Configurations</h4>
                <p class="text-muted mb-0">
                  Configure the transformer model architecture.
                </p>
              </BCol>

              <BCol cols="auto">
                <BButton
                  variant="primary"
                  @click="createTransformerConfig"
                >
                  <i class="bi bi-plus me-1"></i>
                  Create Model Config
                </BButton>
              </BCol>
            </BRow>

            <BTable
              :items="transformerConfigs"
              :fields="transformerConfigFields"
              responsive
              striped
              hover
              bordered
            >
              <template #cell(actions)="{ item }">
                <BButton
                  variant="outline-primary"
                  size="sm"
                  @click="editTransformerConfig(item.entryId)"
                >
                  <i class="bi bi-pencil me-1"></i>
                  Edit
                </BButton>
              </template>

              <template #empty>
                <div class="text-center text-muted py-3">
                  No model configurations found.
                </div>
              </template>
            </BTable>
          </BTab>
        </BTabs>
      </BCardBody>
    </BCard>
  </BContainer>
  <ConfigEditorModal 
    v-model="showCreateConfigModal"
    v-model:name="formName"
    v-model:description="formDescription"
    v-model:training-config="formTrainingConfig"
    v-model:transformer-config="formTransformerConfig"
    :config-type="createConfigType"
    :operation="configOperation"
    @submit="submitConfig"
  />
 
</template>
```
