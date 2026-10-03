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
  BFormInput,
  BFormSelect,
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
import {
  DEFAULT_VOCAB_SIZE,
  MAX_VOCAB_SIZE,
  MIN_VOCAB_SIZE,
} from "../services/CompileVocabularyRequest";
import type {
  CompileVocabularyRequest,
  VocabularyTokenizerType,
} from "../services/CompileVocabularyRequest";

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

// Compile settings sent with every request.
const compileVocabSize = ref<number>(DEFAULT_VOCAB_SIZE);
const compileTokenizerType = ref<VocabularyTokenizerType>("WordLevel");
const compileName = ref("");

const tokenizerOptions: { text: string; value: VocabularyTokenizerType }[] = [
  { text: "Word level (most frequent types)", value: "WordLevel" },
  { text: "BPE (byte pair merges)", value: "Bpe" },
  { text: "SentencePiece (subword units)", value: "SentencePiece" },
];

const vocabProperties = computed(
  () => store.vocabularyPropertiesResponse?.data
);

/**
 * Details of the loaded model's vocabulary: the live token map, the pinned
 * database row (provenance included) and every mismatch the backend found.
 */
const activeVocabulary = computed(
  () => store.activeVocabularyResponse?.data
);

const vocabularyIssues = computed(
  () => activeVocabulary.value?.issues ?? []
);

const vocabularyConsistent = computed(() => {
  const data = activeVocabulary.value;
  if (!data) return null;
  return (data.issues ?? []).length === 0;
});

const pinnedVocabulary = computed(
  () => activeVocabulary.value?.vocabulary ?? null
);

/** Badge for "does the pinned artifact equal the vocabulary being used?". */
const liveMatchBadge = computed<{
  variant: "success" | "danger" | "secondary";
  label: string;
}>(() => {
  const data = activeVocabulary.value;

  if (!data?.vocabulary) {
    return { variant: "secondary", label: "Not pinned" };
  }

  return data.liveVocabularyMatchesModel
    ? { variant: "success", label: "Matches live" }
    : { variant: "danger", label: "Differs from live" };
});

/**
 * Provenance rows for the database entry the model is pinned to: where it came
 * from, what was requested and what was actually produced. Empty when the
 * model has no pinned vocabulary yet.
 */
const pinnedVocabularyRows = computed(() => {
  const entry = pinnedVocabulary.value;

  if (!entry) {
    return [];
  }

  const rows: { property: string; value: string | number }[] = [
    { property: "Tokenizer", value: entry.tokenizerType },
    { property: "Tokens", value: entry.numTokens },
    {
      property: "Requested size",
      value: entry.requestedSize > 0 ? entry.requestedSize : "Not recorded",
    },
    {
      property: "Types observed",
      value: entry.typesSeen > 0 ? entry.typesSeen : "Not measured",
    },
    {
      property: "Coverage",
      value:
        entry.typesSeen > 0
          ? `${Math.round(entry.coverage * 1000) / 10}%`
          : "Not measured",
    },
    {
      property: "Source files",
      value: entry.sourceFileNames || "Not recorded",
    },
    {
      property: "Created",
      value: new Date(entry.dateCreated).toLocaleString(),
    },
    {
      property: "Artifact",
      value: activeVocabulary.value?.vocabularyPath || entry.filepath,
    },
  ];

  const artifactTokens = activeVocabulary.value?.vocabularyFileTokenCount;
  if (artifactTokens != null) {
    rows.push({ property: "Artifact tokens", value: artifactTokens });
  }

  return rows;
});

// Prefer the rich active-vocabulary payload (tokenizer, model, mismatches);
// fall back to the plain properties endpoint when only that has been loaded.
const vocabPropertyRows = computed(() => {
  const props = activeVocabulary.value ?? vocabProperties.value;

  if (!props) {
    return [];
  }

  const rows: { property: string; value: string | number }[] = [
    {
      property: "Vocabulary Size",
      value: props.vocabSize,
    },
  ];

  if (props.tokenizerType) {
    rows.push({
      property: "Tokenizer",
      value: props.tokenizerType,
    });
  }

  rows.push(
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
    }
  );

  return rows;
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

const compileResultFields = [
  {
    key: "property",
    label: "Property",
  },
  {
    key: "value",
    label: "Value",
  },
];

const availableVocabFields = [
  {
    key: "name",
    label: "Vocabulary Name",
  },
  {
    key: "tokenizerType",
    label: "Tokenizer",
  },
  {
    key: "requestedSize",
    label: "Requested Size",
  },
  {
    key: "numTokens",
    label: "Actual Size",
  },
  {
    key: "typesSeen",
    label: "Types Seen",
  },
  {
    key: "coverage",
    label: "Coverage",
  },
  {
    key: "actions",
    label: "Actions",
  },
];  

const compileResult = computed(
  () => store.vocabularyCompileResponse?.data ?? null
);

const compileError = computed(() => store.vocabularyCompileError);

const compileSizeValid = computed(
  () =>
    Number.isFinite(compileVocabSize.value) &&
    compileVocabSize.value >= MIN_VOCAB_SIZE &&
    compileVocabSize.value <= MAX_VOCAB_SIZE
);

const compileResultRows = computed(() => {
  const result = compileResult.value;

  if (!result) {
    return [];
  }

  //Only the word-level compiler collects coverage statistics, so the other
  //algorithms report them as unmeasured instead of a misleading 100%.
  const statsMeasured = result.typesSeen > 0;

  return [
    { property: "Tokenizer", value: result.tokenizerType },
    { property: "Requested size", value: result.requestedVocabSize },
    { property: "Actual size", value: result.actualVocabSize },
    {
      property: "Distinct types seen",
      value: statsMeasured ? result.typesSeen : "Not measured",
    },
    {
      property: "Coverage",
      value: statsMeasured
        ? `${(result.coverage * 100).toFixed(1)}%`
        : "Not measured",
    },
  ];
});

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
    uploadMessage.value =
      store.vocabularyLoadResponse?.message || "Files uploaded successfully.";
    selectedFiles.value = [];

    //Newly uploaded sources must appear in the compile list right away.
    await getVocabSources();
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

/**
 * Deletes a compiled vocabulary, then re-syncs the local copy of the list the
 * table renders from (the store refreshes its own response on success).
 */
const deleteVocabulary = async (name: string) => {
  await store.DeleteVocabulary(name);

  if (store.availableVocabulariesResponse?.data) {
    availableVocabularies.value =
      store.availableVocabulariesResponse.data.vocabularies;
  }
};


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
  if (selectedFilesToCompile.value.length === 0 || !compileSizeValid.value) {
    return;
  }

  isCompiling.value = true;
  compileMessage.value = "";

  const name = compileName.value.trim();

  const request: CompileVocabularyRequest = {
    files: selectedFilesToCompile.value.map(file => file.name),
    vocabSize: compileVocabSize.value,
    tokenizerType: compileTokenizerType.value,
  };

  if (name.length > 0) {
    request.name = name;
  }

  try {
    await store.CompileVocabFiles(request);

    //Failures are recorded by the store so the inline alert can show them.
    if (store.vocabularyCompileError) {
      return;
    }

    compileMessage.value =
      store.vocabularyCompileResponse?.message ||
      "Vocabulary compiled successfully.";

    selectedFilesToCompile.value = [];
    compileName.value = "";

    //The new entry has to show up in the available vocabularies list.
    await getAvailableVocabularies();
  } finally {
    isCompiling.value = false;
  }
};

const getVocabProps = async () => {
  await store.GetVocabProperties();
};

/**
 * Loads the full vocabulary picture for the details tab: the live vocabulary,
 * the row the loaded model is pinned to, and the backend's mismatch list.
 */
const getActiveVocabulary = async () => {
  await store.GetActiveVocabulary();
};

/** Refresh used by the details tab: both the plain and the model-aware view. */
const refreshVocabularyDetails = async () => {
  await getVocabProps();
  await getActiveVocabulary();
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
  await getActiveVocabulary();
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
                      accept=".txt,.log,.json,.jsonl,.ndjson"
                      browse-text="Browse"
                      multiple
                      @update:model-value="addFiles"
                    />

                    <small class="text-muted">
                      Supported formats: .txt, .log, .json, .jsonl, .ndjson
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
                    Select one or more <strong>.txt</strong>,
                    <strong>.log</strong>, <strong>.json</strong> or
                    <strong>.jsonl</strong> files.
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

            <!-- Compilation settings -->
            <BRow class="g-3 mb-3">

              <BCol lg="4">
                <BFormGroup
                  label="Vocabulary size"
                  label-for="vocab-size"
                  :description="
                    `Including special tokens (${MIN_VOCAB_SIZE}-${MAX_VOCAB_SIZE}).`
                  "
                  class="mb-0"
                >
                  <BFormInput
                    id="vocab-size"
                    v-model.number="compileVocabSize"
                    type="number"
                    :min="MIN_VOCAB_SIZE"
                    :max="MAX_VOCAB_SIZE"
                    step="500"
                  />
                </BFormGroup>
              </BCol>

              <BCol lg="4">
                <BFormGroup
                  label="Tokenizer"
                  label-for="vocab-tokenizer"
                  description="Algorithm used to build the vocabulary."
                  class="mb-0"
                >
                  <BFormSelect
                    id="vocab-tokenizer"
                    v-model="compileTokenizerType"
                    :options="tokenizerOptions"
                  />
                </BFormGroup>
              </BCol>

              <BCol lg="4">
                <BFormGroup
                  label="Name (optional)"
                  label-for="vocab-name"
                  description="Omit to generate a unique name."
                  class="mb-0"
                >
                  <BFormInput
                    id="vocab-name"
                    v-model="compileName"
                    placeholder="e.g. koran-20k-wordlevel"
                  />
                </BFormGroup>
              </BCol>

            </BRow>

            <BAlert
              v-if="!compileSizeValid"
              variant="warning"
              show
              class="mb-3"
            >
              <i class="bi bi-exclamation-triangle me-2"></i>

              Vocabulary size must be between
              {{ MIN_VOCAB_SIZE }} and {{ MAX_VOCAB_SIZE }} tokens.
            </BAlert>

            <BAlert
              v-if="compileError"
              variant="danger"
              show
              class="mb-3"
            >
              <i class="bi bi-x-circle me-2"></i>
              {{ compileError }}
            </BAlert>

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

              <!-- Result of the last compilation -->
              <BCard
                v-if="compileResult"
                class="border-success mt-3"
              >
                <BCardHeader class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">
                    <i class="bi bi-clipboard-check me-2"></i>
                    Last compilation
                  </h6>

                  <BBadge variant="success">
                    {{ compileResult.actualVocabSize }} tokens
                  </BBadge>
                </BCardHeader>

                <BCardBody>

                  <BTable
                    :items="compileResultRows"
                    :fields="compileResultFields"
                    responsive
                    striped
                  />

                  <div
                    v-if="compileResult.sampleTokens.length > 0"
                    class="mt-3"
                  >
                    <div class="text-muted small mb-2">
                      Sample tokens (specials first, then most frequent)
                    </div>

                    <div class="d-flex flex-wrap gap-1">
                      <BBadge
                        v-for="token in compileResult.sampleTokens"
                        :key="token"
                        variant="secondary"
                        class="font-monospace"
                      >
                        {{ token }}
                      </BBadge>
                    </div>
                  </div>

                </BCardBody>
              </BCard>

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
                    selectedCompileCount === 0 ||
                    isCompiling ||
                    !compileSizeValid
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
      <!-- AVAILABLE VOCABULARIES -->
      <!-- ========================================================= -->
      <BTab title="Available Vocabularies">
        <BCard>

          <BCardHeader>
            <h5 class="mb-0">
              <i class="bi bi-list me-2"></i>
              Available Vocabularies
            </h5>
          </BCardHeader>

          <BCardBody>

            <div
              v-if="availableVocabularies.length === 0"
              class="text-center text-muted py-5"
            >
              <i class="bi bi-folder2-open fs-1 d-block mb-2"></i>

              <h5>No vocabularies available</h5>

              <p class="mb-0">
                Compile a vocabulary from source files to see it listed here.
              </p>
            </div>

            <BTable
              v-else
              :items="availableVocabularies"
              :fields="availableVocabFields"
              responsive
              striped
              hover
              bordered
            >
              <!--Buttons for management actions can be added here-->
              <template #cell(actions)="{ item }">
                <div class="d-flex justify-content-end gap-2">
                  <BButton
                    size="sm"
                    variant="outline-danger"
                    title="Delete"
                    @click="deleteVocabulary(item.name)"
                  >
                    <i class="bi bi-trash"></i>
                  </BButton>
                </div>
              </template>
            </BTable>

          </BCardBody>
        </BCard>
      </BTab>

      <!-- ========================================================= -->
      <!-- VOCABULARY DETAILS -->
      <!-- ========================================================= -->

      <BTab title="Vocabulary Details">

        <BRow class="g-4">

          <!-- Consistency report: everything the backend found wrong between
               the model config, the pinned artifact and the live vocabulary. -->
          <BCol cols="12">
            <BAlert
              v-if="activeVocabulary && vocabularyConsistent"
              variant="success"
              show
            >
              <div class="d-flex align-items-center">
                <i class="bi bi-check-circle me-2"></i>
                <div>
                  <strong>Vocabulary consistent.</strong>
                  The loaded vocabulary matches
                  {{ activeVocabulary.modelName ?? "the active model" }}
                  and its configuration.
                </div>
              </div>
            </BAlert>

            <BAlert
              v-else-if="vocabularyIssues.length > 0"
              variant="danger"
              show
            >
              <div class="d-flex align-items-start">
                <i class="bi bi-exclamation-triangle me-2 mt-1"></i>
                <div>
                  <strong>
                    {{ vocabularyIssues.length }}
                    vocabulary problem{{ vocabularyIssues.length === 1 ? "" : "s" }}
                    found.
                  </strong>
                  <ul class="mb-0 mt-1">
                    <li
                      v-for="(issue, index) in vocabularyIssues"
                      :key="index"
                    >
                      {{ issue }}
                    </li>
                  </ul>
                </div>
              </div>
            </BAlert>

            <BAlert
              v-else
              variant="secondary"
              show
            >
              No vocabulary details loaded yet. Press Refresh to inspect the
              loaded vocabulary against the model that uses it.
            </BAlert>
          </BCol>

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
                    @click="refreshVocabularyDetails"
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
                    @click="refreshVocabularyDetails"
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
                    :variant="vocabProperties || activeVocabulary ? 'success' : 'secondary'"
                  >
                    {{ vocabProperties || activeVocabulary ? "Loaded" : "Unavailable" }}
                  </BBadge>
                </div>

                <div
                  class="d-flex justify-content-between border-bottom pb-2 mb-2"
                >
                  <span>Pinned vocabulary</span>

                  <BBadge :variant="liveMatchBadge.variant">
                    {{ liveMatchBadge.label }}
                  </BBadge>
                </div>

                <div
                  v-if="vocabProperties || activeVocabulary"
                  class="d-flex justify-content-between border-bottom pb-2 mb-2"
                >
                  <span>Tokens</span>

                  <strong>
                    {{ (activeVocabulary ?? vocabProperties)?.vocabSize }}
                  </strong>
                </div>

                <div
                  v-if="activeVocabulary?.modelName"
                  class="d-flex justify-content-between border-bottom pb-2 mb-2"
                >
                  <span>Model</span>

                  <strong>
                    {{ activeVocabulary.modelName }}
                  </strong>
                </div>

                <div
                  v-if="activeVocabulary?.modelVocabSize != null"
                  class="d-flex justify-content-between border-bottom pb-2 mb-2"
                >
                  <span>Config vocab size</span>

                  <strong>
                    {{ activeVocabulary.modelVocabSize }}
                  </strong>
                </div>

                <div
                  v-if="pinnedVocabulary"
                  class="d-flex justify-content-between"
                >
                  <span>Artifact on disk</span>

                  <BBadge
                    :variant="activeVocabulary?.vocabularyFileExists ? 'success' : 'danger'"
                  >
                    {{ activeVocabulary?.vocabularyFileExists ? "Readable" : "Missing" }}
                  </BBadge>
                </div>

              </BCardBody>
            </BCard>
          </BCol>

          <!-- Provenance of the vocabulary row the model is pinned to. -->
          <BCol
            v-if="pinnedVocabulary"
            cols="12"
          >
            <BCard>
              <BCardHeader>
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 class="mb-1">
                      <i class="bi bi-journal-text me-2"></i>
                      Pinned Vocabulary: {{ pinnedVocabulary.name }}
                    </h5>

                    <small class="text-muted">
                      Database row referenced by
                      {{ activeVocabulary?.modelName ?? "the active model" }}.
                    </small>
                  </div>

                  <BBadge
                    :variant="activeVocabulary?.vocabularyFileExists ? 'success' : 'danger'"
                  >
                    {{ activeVocabulary?.vocabularyFileExists ? "Artifact readable" : "Artifact missing" }}
                  </BBadge>
                </div>
              </BCardHeader>

              <BCardBody>
                <BRow class="g-3">
                  <BCol
                    v-for="row in pinnedVocabularyRows"
                    :key="row.property"
                    md="6"
                  >
                    <div class="d-flex justify-content-between border-bottom pb-2">
                      <span class="text-muted">{{ row.property }}</span>

                      <strong class="text-end ms-3">
                        {{ row.value }}
                      </strong>
                    </div>
                  </BCol>
                </BRow>
              </BCardBody>
            </BCard>
          </BCol>

        </BRow>

      </BTab>

    </BTabs>

  </BContainer>
</template>
