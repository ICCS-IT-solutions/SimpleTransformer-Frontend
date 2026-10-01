<script lang="ts" setup>
import { computed, onMounted, onUnmounted } from "vue";
import {
  BNavItemDropdown,
  BDropdownHeader,
  BDropdownItem,
  BDropdownDivider,
  BDropdownText,
  BSpinner,
} from "bootstrap-vue-next";
import memoryStore from "../stores/memoryStore";

const store = memoryStore();

//The navbar is mounted for the app's whole lifetime, so this poll doubles as
//the app-level status refresh. GETs are interceptor-silent, so polling costs
//nothing in toast noise.
const POLL_MS = 5000;
let timer: number | undefined = undefined;

onMounted(async () => {
  await store.fetchStatus();

  timer = window.setInterval(() => {
    store.fetchStatus();
  }, POLL_MS);
});

onUnmounted(() => {
  if (timer !== undefined) window.clearInterval(timer);
});

const mib = 1024 * 1024;

const status = computed(() => store.status?.data ?? null);

//Tint thresholds mirror MemoryPressureSettings.Lower/UpperBoundPercent
//(70/85), so the badge turns amber exactly where the valve starts trimming
//and red where it permits the blocking compaction.
const pressureClass = computed(() => {
  const pct = status.value?.host.systemUsedPercent ?? null;
  if (pct === null) return "text-muted";
  if (pct >= 85) return "text-danger";
  if (pct >= 70) return "text-warning";
  return "text-success";
});

const percentLabel = computed(() => {
  const pct = status.value?.host.systemUsedPercent ?? null;
  return pct === null ? "--%" : `${Math.round(pct)}%`;
});

//A full reset runs a blocking compaction that would stall a live training
//job, so while one is running the action re-arms the latch only.
const isTraining = computed(() => status.value?.isTraining ?? false);

const resetLabel = computed(() =>
  isTraining.value
    ? "Reset valve only (no stall)"
    : "Reset memory valve (trim + compact)"
);

const resetMemory = async () => {
  await store.resetMemory(!isTraining.value);
};
</script>

<template>
  <BNavItemDropdown
    placement="bottom-end"
    aria-label="Host memory pressure"
  >
    <template #button-content>
      <span :class="pressureClass">
        <i class="bi bi-memory me-1"></i>{{ percentLabel }}
      </span>
    </template>

    <BDropdownHeader>Host memory</BDropdownHeader>

    <BDropdownText v-if="status">
      <div>
        System used:
        <strong>{{ status.host.systemUsedPercent.toFixed(0) }}%</strong>
      </div>
      <div>
        Process:
        <strong>{{ status.host.usedPercent.toFixed(1) }}% ({{ (status.host.privateBytes / mib).toFixed(0) }} MiB)</strong>
      </div>
      <div>
        Working set:
        <strong>{{ (status.host.workingSetBytes / mib).toFixed(0) }} MiB</strong>
      </div>
      <div>
        Quota:
        <strong>{{ (status.host.quotaBytes / mib).toFixed(0) }} MiB</strong>
      </div>
      <div>
        Managed heap:
        <strong>{{ (status.host.managedHeapBytes / mib).toFixed(0) }} MiB</strong>
      </div>
      <div>
        Model:
        <strong>{{ status.modelLoaded ? (status.isTraining ? "loaded, training" : "loaded") : "not loaded" }}</strong>
      </div>
    </BDropdownText>
    <BDropdownText v-else>
      <span class="text-muted">Loading host memory status...</span>
    </BDropdownText>

    <BDropdownDivider />
    <BDropdownHeader>Memory valve</BDropdownHeader>
    <BDropdownText>
      <small class="text-muted">
        {{ status?.valve ?? "no status yet" }}
      </small>
    </BDropdownText>

    <BDropdownDivider />
    <BDropdownItem
      :disabled="store.resetting"
      @click="resetMemory"
    >
      <BSpinner
        v-if="store.resetting"
        small
        class="me-1"
      />
      <i
        v-else
        class="bi bi-arrow-counterclockwise me-1"
      ></i>
      {{ resetLabel }}
    </BDropdownItem>
  </BNavItemDropdown>
</template>