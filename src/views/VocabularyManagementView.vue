```vue
<script lang="ts" setup>
import {
  BContainer,
  BCard,
  BCardHeader,
  BCardBody,
  BTabs,
  BTab,
  BForm,
  BFormGroup,
  BFormFile,
  BButton,
  BTable,
  BFormCheckbox,
  BBadge,
  BAlert,
  BRow,
  BCol,
  BButtonGroup,
} from "bootstrap-vue-next";
import vocabStore from "../stores/vocabStore";
import { computed, onMounted, ref } from "vue";
import type { VocabularySourceFile } from "../services/VocabularySourceFile";
import type { VocabularyEntry } from "../services/VocabularyEntry";

const store = vocabStore();

const vocabFilesInput = ref<File[]>([]);
const selectedFiles = ref<File[]>([]);
const filesToCompile = ref<VocabularySourceFile[]>([]);
const selectedFilesToCompile = ref<VocabularySourceFile[]>([]);
const availableVocabularies = ref<VocabularyEntry[]>([]);

const isUploading = ref(false);
const isCompiling = ref(false);
const uploadMessage = ref("");
const compileMessage = ref("");

const vocabProperties = computed(
  () => store.vocabularyPropertiesResponse?.data
);

const vocabPropertyRows = computed(() => {
  const props = vocabProperties.value;

  if (!props) {
    return [];
  }

  return [
    {
      property: "Vocabulary Size",
      value: props.vocabSize,
    },
    {
      property: "Unknown Token",
      value: props.unknownToken,
    },
    {
      property: "Padding Token",
      value: props.paddingToken,
    },
    {
      property: "BOS Token",
      value: props.bosToken,
    },
    {
      property: "EOS Token",
      value: props.eosToken,
    },
    {
      property: "Mask Token",
      value: props.maskToken,
    },
  ];
});

const vocabPropertyFields = [
  {
    key: "property",
    label: "Property",
  },
  {
    key: "value",
    label: "Value",
  },
];

const uploadFields = [
  {
    key: "name",
    label: "File",
  },
  {
    key: "size",
    label: "Size",
  },
  {
    key: "actions",
    label: "",
    class: "text-end",
  },
];

const compileFields = [
  {
    key: "selected",
    label: "",
    thClass: "text-center",
    tdClass: "text-center",
  },
  {
    key: "name",
    label: "File",
  },
  {
    key: "fileSize",
    label: "Size",
  },
];

const availableVocabulariesFields = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "size",
    label: "Size",
  }
]

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const uploadTableItems = computed(() =>
  selectedFiles.value.map(file => ({
    file,
    name: file.name,
    size: formatFileSize(file.size),
  }))
);

const selectedCompileCount = computed(
  () => selectedFilesToCompile.value.length
);

const allCompileFilesSelected = computed(
  () =>
    filesToCompile.value.length > 0 &&
    selectedFilesToCompile.value.length === filesToCompile.value.length
);

const addFiles = (files: File | readonly File[] | null) => {
  if (!files) {
    return;
  }

  const newFiles = Array.isArray(files) ? files : [files];

  for (const file of newFiles) {
    const alreadyExists = selectedFiles.value.some(
      existing =>
        existing.name === file.name &&
        existing.size === file.size &&
        existing.lastModified === file.lastModified
    );

    if (!alreadyExists) {
      selectedFiles.value.push(file);
    }
  }

  // Clear the input so the same file can be selected again if necessary
  vocabFilesInput.value = [];
};

const removeUploadFile = (file: File) => {
  selectedFiles.value = selectedFiles.value.filter(
    existing =>
      !(
        existing.name === file.name &&
        existing.size === file.size &&
        existing.lastModified === file.lastModified
      )
  );
};

const clearUploadFiles = () => {
  selectedFiles.value = [];
};

const uploadFiles = async () => {
  if (selectedFiles.value.length === 0) {
    return;
  }

  isUploading.value = true;
  uploadMessage.value = "";

  try {
    await store.UploadVocabFile(selectedFiles.value);
    uploadMessage.value = "Files uploaded successfully.";
    selectedFiles.value = [];
  } finally {
    isUploading.value = false;
  }
};

onMounted(async () => {
  await getAvailableVocabularies();
})

const getAvailableVocabularies = async () => {
  await store.GetVocabularies();

  if (store.availableVocabulariesResponse?.data) {
    availableVocabularies.value = store.availableVocabulariesResponse.data.vocabularies;
  }

}

const isFileSelected = (file: VocabularySourceFile) =>
  selectedFilesToCompile.value.some(
    selected => selected.name === file.name
  );

const toggleFileSelection = (
  file: VocabularySourceFile,
  selected: boolean
) => {
  if (selected) {
    if (!isFileSelected(file)) {
      selectedFilesToCompile.value.push(file);
    }
  } else {
    selectedFilesToCompile.value =
      selectedFilesToCompile.value.filter(
        existing => existing.name !== file.name
      );
  }
};

const toggleSelectAll = () => {
  if (allCompileFilesSelected.value) {
    selectedFilesToCompile.value = [];
  } else {
    selectedFilesToCompile.value = [...filesToCompile.value];
  }
};

const clearCompileSelection = () => {
  selectedFilesToCompile.value = [];
};

const compileFiles = async () => {
  if (selectedFilesToCompile.value.length === 0) {
    return;
  }

  isCompiling.value = true;
  compileMessage.value = "";

  try {
    await store.CompileVocabFiles(
      selectedFilesToCompile.value.map(file => file.name)
    );

    compileMessage.value = "Vocabulary compiled successfully.";
    selectedFilesToCompile.value = [];
  } finally {
    isCompiling.value = false;
  }
};

const getVocabProps = async () => {
  await store.GetVocabProperties();
};

const getVocabSources = async () => {
  await store.GetVocabSources();

  if (store.sourceFiles !== null) {
    filesToCompile.value = store.sourceFiles.data;
  }
};

onMounted(async () => {
  await getVocabSources();
  await getVocabProps();
});
</script>

<template>
  <BContainer fluid class="py-4">

    <!-- Page header -->
    <div class="mb-4">
      <h2 class="mb-1">
        <i class="bi bi-book me-2"></i>
        Vocabulary Management
      </h2>

      <p class="text-muted mb-0">
        Upload source material, build vocabularies, and inspect the active
        vocabulary configuration.
      </p>
    </div>

    <BTabs content-class="pt-4">

      <!-- ========================================================= -->
      <!-- UPLOAD -->
      <!-- ========================================================= -->

      <BTab title="Upload Sources">

        <BRow class="g-4">

          <BCol lg="8">
            <BCard class="h-100">

              <BCardHeader>
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 class="mb-1">
                      <i class="bi bi-cloud-arrow-up me-2"></i>
                      Source Files
                    </h5>

                    <small class="text-muted">
                      Select one or more plain-text files to add to the
                      vocabulary source collection.
                    </small>
                  </div>

                  <BBadge variant="secondary">
                    {{ selectedFiles.length }} selected
                  </BBadge>
                </div>
              </BCardHeader>

              <BCardBody>

                <BForm @submit.prevent="uploadFiles">

                  <BFormGroup
                    label="Select files"
                    label-for="vocab-file"
                    class="mb-4"
                  >
                    <BFormFile
                      id="vocab-file"
                      v-model="vocabFilesInput"
                      accept=".txt"
                      browse-text="Browse"
                      multiple
                      @update:model-value="addFiles"
                    />

                    <small class="text-muted">
                      Supported format: .txt
                    </small>
                  </BFormGroup>

                  <BAlert
                    v-if="uploadMessage"
                    variant="success"
                    show
                    dismissible
                  >
                    <i class="bi bi-check-circle me-2"></i>
                    {{ uploadMessage }}
                  </BAlert>

                  <!-- Pending files -->
                  <div v-if="selectedFiles.length > 0">

                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <h6 class="mb-0">
                        Files queued for upload
                      </h6>

                      <BButton
                        variant="link"
                        size="sm"
                        class="text-danger"
                        @click="clearUploadFiles"
                      >
                        Clear all
                      </BButton>
                    </div>

                    <BTable
                      :items="uploadTableItems"
                      :fields="uploadFields"
                      responsive
                      striped
                      hover
                    >
                      <template #cell(actions)="{ item }">
                        <BButton
                          size="sm"
                          variant="outline-danger"
                          title="Remove file"
                          @click="removeUploadFile(item.file)"
                        >
                          <i class="bi bi-trash"></i>
                        </BButton>
                      </template>
                    </BTable>

                  </div>

                  <div
                    v-else
                    class="text-center text-muted py-5 border rounded"
                  >
                    <i class="bi bi-file-earmark-text fs-1 d-block mb-2"></i>

                    <div>No files selected.</div>

                    <small>
                      Choose files above to add them to the upload queue.
                    </small>
                  </div>

                  <div class="d-flex justify-content-end mt-4">
                    <BButton
                      type="submit"
                      variant="primary"
                      :disabled="
                        selectedFiles.length === 0 || isUploading
                      "
                    >
                      <i class="bi bi-cloud-arrow-up me-2"></i>

                      {{
                        isUploading
                          ? "Uploading..."
                          : `Upload ${selectedFiles.length || ""} Files`
                      }}
                    </BButton>
                  </div>

                </BForm>

              </BCardBody>
            </BCard>
          </BCol>

          <!-- Information panel -->
          <BCol lg="4">
            <BCard class="h-100">

              <BCardHeader>
                <h5 class="mb-0">
                  <i class="bi bi-info-circle me-2"></i>
                  Upload workflow
                </h5>
              </BCardHeader>

              <BCardBody>

                <ol class="mb-0 ps-3">

                  <li class="mb-3">
                    Select one or more <strong>.txt</strong> files.
                  </li>

                  <li class="mb-3">
                    Review the files in the upload queue.
                  </li>

                  <li class="mb-3">
                    Upload the files to the backend.
                  </li>

                  <li>
                    Once uploaded, they become available in
                    <strong>Compile Vocabulary</strong>.
                  </li>

                </ol>

              </BCardBody>
            </BCard>
          </BCol>

        </BRow>

      </BTab>


      <!-- ========================================================= -->
      <!-- COMPILE -->
      <!-- ========================================================= -->

      <BTab title="Compile Vocabulary">

        <BCard>

          <BCardHeader>
            <div class="d-flex justify-content-between align-items-center">

              <div>
                <h5 class="mb-1">
                  <i class="bi bi-cpu me-2"></i>
                  Vocabulary Compilation
                </h5>

                <small class="text-muted">
                  Select source files and compile them into a vocabulary.
                </small>
              </div>

              <BBadge variant="secondary">
                {{ selectedCompileCount }} selected
              </BBadge>

            </div>
          </BCardHeader>

          <BCardBody>

            <BAlert
              v-if="compileMessage"
              variant="success"
              show
              dismissible
            >
              <i class="bi bi-check-circle me-2"></i>
              {{ compileMessage }}
            </BAlert>

            <div
              v-if="filesToCompile.length === 0"
              class="text-center text-muted py-5"
            >
              <i class="bi bi-folder2-open fs-1 d-block mb-2"></i>

              <h5>No vocabulary source files</h5>

              <p class="mb-0">
                Upload some source files before attempting to compile a
                vocabulary.
              </p>
            </div>

            <template v-else>

              <!-- Toolbar -->
              <div class="d-flex justify-content-between align-items-center mb-3">

                <div>
                  <strong>{{ filesToCompile.length }}</strong>
                  source files available
                </div>

                <BButtonGroup>

                  <BButton
                    variant="outline-primary"
                    size="sm"
                    @click="toggleSelectAll"
                  >
                    <i
                      :class="
                        allCompileFilesSelected
                          ? 'bi bi-square me-1'
                          : 'bi bi-check-square me-1'
                      "
                    ></i>

                    {{
                      allCompileFilesSelected
                        ? "Clear Selection"
                        : "Select All"
                    }}
                  </BButton>

                  <BButton
                    variant="outline-secondary"
                    size="sm"
                    :disabled="selectedCompileCount === 0"
                    @click="clearCompileSelection"
                  >
                    Clear
                  </BButton>

                </BButtonGroup>

              </div>

              <BTable
                :items="filesToCompile"
                :fields="compileFields"
                responsive
                striped
                hover
              >

                <template #cell(selected)="{ item }">
                  <BFormCheckbox
                    :model-value="isFileSelected(item)"
                    :aria-label="`Select ${item.name}`"
                    @update:model-value="
                      checked =>
                        toggleFileSelection(item, checked as boolean)
                    "
                  />
                </template>

              </BTable>

              <div class="d-flex justify-content-between align-items-center mt-3">

                <span class="text-muted">
                  <i class="bi bi-check2-square me-1"></i>

                  {{ selectedCompileCount }}
                  of
                  {{ filesToCompile.length }}
                  files selected
                </span>

                <BButton
                  variant="primary"
                  :disabled="
                    selectedCompileCount === 0 || isCompiling
                  "
                  @click="compileFiles"
                >
                  <i class="bi bi-cpu me-2"></i>

                  {{
                    isCompiling
                      ? "Compiling..."
                      : "Compile Vocabulary"
                  }}
                </BButton>

              </div>

            </template>

          </BCardBody>
        </BCard>

      </BTab>

      <!-- ========================================================= -->
      <!-- VOCABULARY DETAILS -->
      <!-- ========================================================= -->

      <BTab title="Vocabulary Details">

        <BRow class="g-4">

          <BCol lg="8">
            <BCard>

              <BCardHeader>
                <div class="d-flex justify-content-between align-items-center">

                  <div>
                    <h5 class="mb-1">
                      <i class="bi bi-list-columns me-2"></i>
                      Vocabulary Properties
                    </h5>

                    <small class="text-muted">
                      Properties of the currently loaded vocabulary.
                    </small>
                  </div>

                  <BButton
                    variant="outline-secondary"
                    size="sm"
                    @click="getVocabProps"
                  >
                    <i class="bi bi-arrow-clockwise me-1"></i>
                    Refresh
                  </BButton>

                </div>
              </BCardHeader>

              <BCardBody>

                <BTable
                  v-if="vocabProperties"
                  :items="vocabPropertyRows"
                  :fields="vocabPropertyFields"
                  responsive
                  striped
                  hover
                />

                <div
                  v-else
                  class="text-center text-muted py-5"
                >
                  <i class="bi bi-question-circle fs-1 d-block mb-2"></i>

                  <div>
                    No vocabulary information is currently available.
                  </div>

                  <BButton
                    class="mt-3"
                    variant="primary"
                    @click="getVocabProps"
                  >
                    Load Vocabulary Information
                  </BButton>
                </div>

              </BCardBody>
            </BCard>
          </BCol>

          <BCol lg="4">
            <BCard>

              <BCardHeader>
                <h5 class="mb-0">
                  <i class="bi bi-database me-2"></i>
                  Vocabulary Status
                </h5>
              </BCardHeader>

              <BCardBody>

                <div
                  class="d-flex justify-content-between border-bottom pb-2 mb-2"
                >
                  <span>Status</span>

                  <BBadge
                    :variant="vocabProperties ? 'success' : 'secondary'"
                  >
                    {{ vocabProperties ? "Loaded" : "Unavailable" }}
                  </BBadge>
                </div>

                <div
                  v-if="vocabProperties"
                  class="d-flex justify-content-between"
                >
                  <span>Tokens</span>

                  <strong>
                    {{ vocabProperties.vocabSize }}
                  </strong>
                </div>

              </BCardBody>
            </BCard>
          </BCol>

        </BRow>

      </BTab>

    </BTabs>

  </BContainer>
</template>
```
