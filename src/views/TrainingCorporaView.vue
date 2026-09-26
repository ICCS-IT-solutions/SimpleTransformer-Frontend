```vue
<script lang="ts" setup>
import {
  BContainer,
  BCard,
  BCardHeader,
  BCardBody,
  BCardTitle,
  BRow,
  BCol,
  BButton,
  BForm,
  BFormGroup,
  BFormInput,
  BFormCheckbox,
  BFormSelect,
  BFormFile,
  BTable,
  BAlert,
  BBadge,
} from "bootstrap-vue-next";

import corpusStore from "../stores/corpusStore";
import trainingStore from "../stores/trainingStore";

import { computed, onMounted, ref } from "vue";

import type { CorpusSourceFormat } from "../services/TrainingFileRequest";

const store = corpusStore();
const trainStore = trainingStore();

const corpusFilesInput = ref<File | readonly File[] | null>(null);
const selectedFiles = computed<File[]>(() => {
  const value = corpusFilesInput.value as File | File[] | null;
  if (value === null) return [];
  return Array.isArray(value) ? value : [value];
});

const corpusName = ref("");
const saveMessage = ref("");

const formatOptions: { text: string; value: CorpusSourceFormat }[] = [
  { text: "Auto (from extension)", value: "auto" },
  { text: "Plain text", value: "txt" },
  { text: "JSON", value: "json" },
  { text: "JSON Lines", value: "jsonl" },
];

const options = computed(() => trainStore.preprocessOptions);

const preview = computed(() => store.corpusPreview?.data ?? null);
const previewMessage = computed(() => store.corpusPreview?.message ?? "");
const previewUsable = computed(() => (preview.value?.documentsOut ?? 0) > 0);

const previewFields = [
  { key: "fileName", label: "File" },
  { key: "cleaned", label: "Cleaned sample" },
];

const corpusFields = [
  { key: "name", label: "Name" },
  { key: "documentsOut", label: "Docs" },
  { key: "charsOut", label: "Chars" },
  { key: "sourceFileNames", label: "Sources" },
  { key: "usedByJobs", label: "Jobs" },
  { key: "actions", label: "", class: "text-end" },
];

const formatChars = (chars: number): string => {
  if (chars < 1000) return `${chars}`;
  if (chars < 1000000) return `${(chars / 1000).toFixed(1)}k`;
  return `${(chars / 1000000).toFixed(1)}M`;
};

const previewSelected = async () => {
  saveMessage.value = "";
  await store.previewCorpus(selectedFiles.value, {
    format: options.value.format,
    textField: options.value.textField || undefined,
    template: options.value.template || undefined,
    normalizeWhitespace: options.value.normalizeWhitespace,
    stripHtml: options.value.stripHtml,
    deduplicate: options.value.deduplicate,
    minChars: options.value.minChars,
    maxChars: options.value.maxChars,
  });
};

const saveCorpus = async () => {
  if (!corpusName.value.trim() || selectedFiles.value.length === 0) return;

  saveMessage.value = "";
  const response = await store.createCorpus({
    name: corpusName.value.trim(),
    textFiles: selectedFiles.value,
    format: options.value.format,
    textField: options.value.textField || undefined,
    template: options.value.template || undefined,
    normalizeWhitespace: options.value.normalizeWhitespace,
    stripHtml: options.value.stripHtml,
    deduplicate: options.value.deduplicate,
    minChars: options.value.minChars,
    maxChars: options.value.maxChars,
  });

  saveMessage.value = response.message;
  corpusName.value = "";
  corpusFilesInput.value = null;
};

const deleteCorpus = async (corpusId: string) => {
  await store.deleteCorpus(corpusId);
};

const cloneOptions = (optionsJson: string) => {
  try {
    const parsed = JSON.parse(optionsJson);
    trainStore.preprocessOptions = {
      format: parsed.format?.toLowerCase?.() ?? "auto",
      textField: parsed.textField ?? "",
      template: parsed.template ?? "",
      normalizeWhitespace: parsed.normalizeWhitespace ?? true,
      stripHtml: parsed.stripHtml ?? false,
      deduplicate: parsed.deduplicate ?? true,
      minChars: parsed.minChars ?? 0,
      maxChars: parsed.maxChars ?? 0,
    };
    saveMessage.value = "Options copied to the Training view preprocessing form.";
  } catch {
    saveMessage.value = "Could not parse this corpus's stored options.";
  }
};

onMounted(async () => {
  await store.getCorpora();
});
</script>
<template>
  <BContainer fluid class="py-4">
    <div class="mb-4">
      <h2 class="mb-1">
        Training Data
      </h2>
      <p class="text-muted mb-0">
        Prepare named training corpora from .txt, .json or .jsonl sources,
        then select them when creating training jobs.
      </p>
    </div>
    <BRow class="g-4">
      <BCol lg="7">
        <BCard class="h-100">
          <BCardHeader>
            <BCardTitle class="mb-0">
              Prepare corpus
            </BCardTitle>
          </BCardHeader>
          <BCardBody>
            <BForm @submit.prevent="saveCorpus">
              <BFormGroup
                label="Corpus name"
                label-for="corpus-name"
                description="Unique snapshot name. Changing options later means a new corpus."
                class="mb-3"
              >
                <BFormInput
                  id="corpus-name"
                  v-model="corpusName"
                  placeholder="e.g. bible-kjv-clean"
                />
              </BFormGroup>
              <BFormGroup
                label="Source files"
                label-for="corpus-files"
                description="Originals are kept beside the cleaned corpus."
                class="mb-3"
              >
                <BFormFile
                  id="corpus-files"
                  v-model="corpusFilesInput"
                  multiple
                  accept=".txt,.json,.jsonl,.ndjson"
                  browse-text="Browse"
                />
              </BFormGroup>
              <BRow>
                <BCol md="6">
                  <BFormGroup
                    label="Format"
                    label-for="corpus-format"
                    class="mb-3"
                  >
                    <BFormSelect
                      id="corpus-format"
                      v-model="options.format"
                      :options="formatOptions"
                    />
                  </BFormGroup>
                  <BFormGroup
                    label="Text field"
                    label-for="corpus-text-field"
                    class="mb-3"
                  >
                    <BFormInput
                      id="corpus-text-field"
                      v-model="options.textField"
                      placeholder="text"
                    />
                  </BFormGroup>
                  <BFormGroup
                    label="Template"
                    label-for="corpus-template"
                    class="mb-3"
                  >
                    <BFormInput
                      id="corpus-template"
                      v-model="options.template"
                      placeholder="{prompt} {completion}"
                    />
                  </BFormGroup>
                </BCol>
                <BCol md="6">
                  <BFormGroup
                    label="Minimum chars"
                    label-for="corpus-min-chars"
                    class="mb-3"
                  >
                    <BFormInput
                      id="corpus-min-chars"
                      v-model.number="options.minChars"
                      type="number"
                      min="0"
                    />
                  </BFormGroup>
                  <BFormGroup
                    label="Maximum chars (0 = unlimited)"
                    label-for="corpus-max-chars"
                    class="mb-3"
                  >
                    <BFormInput
                      id="corpus-max-chars"
                      v-model.number="options.maxChars"
                      type="number"
                      min="0"
                    />
                  </BFormGroup>
                  <BFormCheckbox
                    v-model="options.normalizeWhitespace"
                    class="mb-2"
                  >
                    Normalize whitespace
                  </BFormCheckbox>
                  <BFormCheckbox
                    v-model="options.deduplicate"
                    class="mb-2"
                  >
                    Remove exact duplicates
                  </BFormCheckbox>
                  <BFormCheckbox
                    v-model="options.stripHtml"
                    class="mb-2"
                  >
                    Strip HTML
                  </BFormCheckbox>
                </BCol>
              </BRow>
              <div class="d-flex gap-2 mt-2">
                <BButton
                  type="button"
                  variant="outline-primary"
                  :disabled="selectedFiles.length === 0 || store.isPreviewing"
                  @click="previewSelected"
                >
                  {{ store.isPreviewing ? "Previewing..." : "Preview" }}
                </BButton>
                <BButton
                  type="submit"
                  variant="primary"
                  :disabled="selectedFiles.length === 0 || !corpusName.trim() || store.isSaving"
                >
                  {{ store.isSaving ? "Saving..." : "Save corpus" }}
                </BButton>
              </div>
              <BAlert
                v-if="saveMessage"
                variant="info"
                show
                class="mt-3 mb-0"
              >
                {{ saveMessage }}
              </BAlert>
              <div
                v-if="preview"
                class="mt-3"
              >
                <BAlert
                  :variant="previewUsable ? 'success' : 'warning'"
                  show
                >
                  {{ previewMessage }}
                </BAlert>
                <BRow class="g-2 mb-3">
                  <BCol cols="6" md="3">
                    <small class="text-muted d-block">Documents</small>
                    <strong>{{ preview.documentsOut }} / {{ preview.documentsIn }}</strong>
                  </BCol>
                  <BCol cols="6" md="3">
                    <small class="text-muted d-block">Chars</small>
                    <strong>{{ preview.charsOut }} / {{ preview.charsIn }}</strong>
                  </BCol>
                  <BCol cols="6" md="3">
                    <small class="text-muted d-block">Duplicates removed</small>
                    <strong>{{ preview.duplicatesRemoved }}</strong>
                  </BCol>
                  <BCol cols="6" md="3">
                    <small class="text-muted d-block">Filtered</small>
                    <strong>{{ preview.filteredByLength + preview.filteredEmpty }}</strong>
                  </BCol>
                </BRow>
                <BAlert
                  v-if="preview.warnings.length > 0"
                  variant="warning"
                  show
                >
                  <ul class="mb-0">
                    <li
                      v-for="(warning, index) in preview.warnings.slice(0, 10)"
                      :key="index"
                    >
                      {{ warning }}
                    </li>
                  </ul>
                </BAlert>
                <BTable
                  v-if="preview.samples.length > 0"
                  :items="preview.samples"
                  :fields="previewFields"
                  small
                  striped
                />
              </div>
<!-- __PREVIEW__ -->
            </BForm>
          </BCardBody>
        </BCard>
      </BCol>
      <BCol lg="5">
        <BCard class="h-100">
          <BCardHeader>
            <BCardTitle class="mb-0">
              Saved corpora
            </BCardTitle>
          </BCardHeader>
          <BCardBody>
            <BAlert
              v-if="store.corpora.length === 0 && !store.isLoading"
              variant="info"
              show
            >
              No corpora yet. Prepare one on the left.
            </BAlert>
            <BTable
              v-else
              :items="store.corpora"
              :fields="corpusFields"
              :busy="store.isLoading"
              small
              striped
            >
              <template #cell(documentsOut)="row">
                {{ row.item.documentsOut }} / {{ row.item.documentsIn }}
              </template>
              <template #cell(charsOut)="row">
                {{ formatChars(row.item.charsOut) }}
              </template>
              <template #cell(usedByJobs)="row">
                <BBadge :variant="row.item.usedByJobs > 0 ? 'success' : 'secondary'">
                  {{ row.item.usedByJobs }}
                </BBadge>
              </template>
              <template #cell(actions)="row">
                <div class="d-flex justify-content-end gap-1">
                  <BButton
                    size="sm"
                    variant="outline-secondary"
                    title="Copy options to the Training view form"
                    @click="cloneOptions(row.item.optionsJson)"
                  >
                    Clone options
                  </BButton>
                  <BButton
                    size="sm"
                    variant="outline-danger"
                    @click="deleteCorpus(row.item.entryId)"
                  >
                    Delete
                  </BButton>
                </div>
              </template>
            </BTable>
          </BCardBody>
        </BCard>
      </BCol>
<!-- __SAVED__ -->
    </BRow>
  </BContainer>
</template>
```