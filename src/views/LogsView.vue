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
  BFormSelect,
  BFormCheckbox,
  BTable,
  BAlert,
  BBadge,
  BSpinner,
} from "bootstrap-vue-next";

import logsStore from "../stores/logsStore";

import { computed, onMounted, onUnmounted, ref } from "vue";

const store = logsStore();

/** Serilog's three-letter tokens, matching what the file sink emits. */
const levelOptions = [
  { text: "All levels", value: "" },
  { text: "Errors (ERR)", value: "ERR" },
  { text: "Fatal (FTL)", value: "FTL" },
  { text: "Warnings (WRN)", value: "WRN" },
  { text: "Information (INF)", value: "INF" },
  { text: "Debug (DBG)", value: "DBG" },
];

//An empty selectedFile means "all retained days" - the cross-file search mode.
const fileOptions = computed(() => [
  { text: "All retained days", value: "" },
  ...store.files.map((f) => ({
    text: `${f.name} (${formatBytes(f.sizeBytes)})`,
    value: f.name,
  })),
]);

const totalFaults = computed(() =>
  store.faults.reduce((sum, f) => sum + f.occurrenceCount, 0)
);

/**
 * Badge colour for a level token. Typed against BBadge's variant union so a
 * typo cannot silently fall through to an unstyled badge.
 */
const levelVariant = (level: string): "danger" | "warning" | "dark" | "secondary" => {
  switch (level) {
    case "ERR":
    case "FTL":
      return "danger";
    case "WRN":
      return "warning";
    case "DBG":
      return "dark";
    default:
      return "secondary";
  }
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Truncates for the table; the full text is in the row's title attribute. */
const preview = (message: string, max = 160): string => {
  const flat = message.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max)}...`;
};

const formatTimestamp = (value: string): string => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
};

//Auto-refresh is opt-in and silent: the service passes silent:true so a failing
//backend cannot stack one error toast per interval.
const autoRefresh = ref(false);
let refreshTimer: ReturnType<typeof setInterval> | null = null;

const applyAndLoad = async () => {
  await store.getLogs();
};

onMounted(async () => {
  await store.getFiles();
  await Promise.all([store.getLogs(), store.getFaults()]);
});

onUnmounted(() => {
  if (refreshTimer !== null) clearInterval(refreshTimer);
});

const toggleAutoRefresh = () => {
  if (autoRefresh.value) {
    refreshTimer = setInterval(() => store.getLogs(), 5000);
  } else if (refreshTimer !== null) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

const fileFields = [
  { key: "timestamp", label: "Time" },
  { key: "level", label: "Level" },
  { key: "message", label: "Message" },
];

const faultFields = [
  { key: "lastSeenAt", label: "Last seen" },
  { key: "faultType", label: "Type" },
  { key: "component", label: "Component" },
  { key: "occurrenceCount", label: "Count" },
  { key: "message", label: "Message" },
];
</script>

<template>
  <BContainer fluid class="py-4">
    <h2 class="mb-1">Diagnostics</h2>
    <p class="text-muted">
      Server logs rotate daily and seven days are retained. Fault events are
      stored in the database and persist beyond the log retention window.
    </p>

    <BAlert v-if="store.errorMessage" variant="danger" :show="true">
      {{ store.errorMessage }}
    </BAlert>
<!-- __FILTERS__ -->
    <BRow class="mb-3">
      <BCol lg="7">
        <BCard>
          <BCardHeader>
            <BCardTitle class="mb-0">Log files</BCardTitle>
          </BCardHeader>
          <BCardBody>
            <BForm class="d-flex flex-wrap gap-2 align-items-end" @submit.prevent="applyAndLoad">
              <BFormGroup label="File" class="mb-0" style="min-width: 220px">
                <BFormSelect
                  v-model="store.selectedFile"
                  :options="fileOptions"
                  @change="applyAndLoad"
                />
              </BFormGroup>
              <BFormGroup label="Level" class="mb-0">
                <BFormSelect
                  v-model="store.level"
                  :options="levelOptions"
                  @change="applyAndLoad"
                />
              </BFormGroup>
              <BFormGroup label="Search" class="mb-0" style="min-width: 200px">
                <BFormInput
                  v-model="store.search"
                  placeholder="Filter message text"
                  @keyup.enter="applyAndLoad"
                />
              </BFormGroup>
              <div class="d-flex gap-2">
                <BButton variant="primary" :disabled="store.isLoading" @click="applyAndLoad">
                  <BSpinner v-if="store.isLoading" small class="me-1" />
                  Refresh
                </BButton>
                <BButton
                  variant="outline-secondary"
                  :disabled="store.isLoading"
                  @click="store.resetFilters()"
                >
                  Clear filters
                </BButton>
              </div>
            </BForm>

            <BFormCheckbox
              v-model="autoRefresh"
              class="mt-3 mb-0"
              @change="toggleAutoRefresh"
            >
              Auto-refresh every 5s
            </BFormCheckbox>
          </BCardBody>
        </BCard>
      </BCol>

      <BCol lg="5">
        <BCard class="h-100">
          <BCardHeader>
            <BCardTitle class="mb-0">Retained fault events</BCardTitle>
          </BCardHeader>
          <BCardBody>
            <p class="text-muted small mb-2">
              {{ store.faults.length }} distinct signature(s),
              {{ totalFaults }} total occurrence(s). These persist after the
              log files rotate away.
            </p>
            <BTable
              :items="store.faults"
              :fields="faultFields"
              :busy="store.isLoadingFaults"
              small
              striped
            >
              <template #cell(lastSeenAt)="row">
                <small>{{ formatTimestamp(row.item.lastSeenAt) }}</small>
              </template>
              <template #cell(component)="row">
                <BBadge variant="info">{{ row.item.component }}</BBadge>
              </template>
              <template #cell(occurrenceCount)="row">
                <BBadge variant="danger">{{ row.item.occurrenceCount }}</BBadge>
              </template>
              <template #cell(message)="row">
                <span :title="row.item.message">{{ preview(row.item.message, 90) }}</span>
              </template>
              <template #empty>
                <span class="text-muted">No faults recorded.</span>
              </template>
            </BTable>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>

    <BCard>
      <BCardHeader class="d-flex justify-content-between align-items-center">
        <BCardTitle class="mb-0">
          Log entries
          <small class="text-muted ms-2">
            newest last, {{ store.entries.length }} shown
          </small>
        </BCardTitle>
        <BButton
          size="sm"
          variant="outline-secondary"
          :disabled="store.isLoading"
          @click="store.getLogs()"
        >
          Reload
        </BButton>
      </BCardHeader>
      <BCardBody>
        <BAlert v-if="store.truncated" variant="warning" :show="true">
          Partial results: the source was larger than the read window or the
          entry cap, so older entries are not shown.
        </BAlert>
        <BAlert v-if="store.entries.length === 0 && !store.isLoading" variant="info" :show="true">
          No log entries matched.
        </BAlert>
        <BTable
          v-else
          :items="store.entries"
          :fields="fileFields"
          :busy="store.isLoading"
          small
          striped
        >
          <template #cell(timestamp)="row">
            <small class="text-nowrap">
              {{ formatTimestamp(row.item.timestamp) }}
            </small>
          </template>
          <template #cell(level)="row">
            <BBadge :variant="levelVariant(row.item.level)">
              {{ row.item.level }}
            </BBadge>
          </template>
          <template #cell(message)="row">
            <span class="font-monospace small" :title="row.item.message">
              {{ preview(row.item.message) }}
            </span>
          </template>
        </BTable>
      </BCardBody>
    </BCard>
  </BContainer>
</template>