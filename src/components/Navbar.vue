<script lang="ts" setup>
import {
  BNavbar,
  BNavbarBrand,
  BNavbarToggle,
  BNavbarNav,
  BNavItem,
  BCollapse,
} from "bootstrap-vue-next";
</script>

<template>
  <BNavbar
    toggleable="lg"
    variant="dark"
    class="px-3"
  >
    <BNavbarBrand
      :to="{ name: 'home' }"
      class="fw-semibold"
    >
      <i class="bi bi-cpu me-2"></i>
      SimpleTransformer
    </BNavbarBrand>

    <BNavbarToggle target="main-navbar">
      <i class="bi bi-list"></i>
    </BNavbarToggle>

    <BCollapse id="main-navbar" is-nav>
      <BNavbarNav class="me-auto">

        <BNavItem :to="{ name: 'home' }">
          <i class="bi bi-speedometer2 me-1"></i>
          Dashboard
        </BNavItem>

        <BNavItem :to="{ name: 'infer' }">
          <i class="bi bi-chat-square-text me-1"></i>
          Inference
        </BNavItem>

        <BNavItem :to="{ name: 'train' }">
          <i class="bi bi-graph-up-arrow me-1"></i>
          Training
        </BNavItem>

        <BNavItem :to="{ name: 'vocab' }">
          <i class="bi bi-book me-1"></i>
          Vocabulary
        </BNavItem>

        <BNavItem :to="{ name: 'config' }">
          <i class="bi bi-gear me-1"></i>
          Configuration Management
        </BNavItem>

        <BNavItem :to="{ name: 'models' }">
          <i class="bi bi-cpu me-1"></i>
          Models
        </BNavItem>

      </BNavbarNav>

      <BNavbarNav class="ms-auto">

        <BNavItem>
          <span class="text-success">
            <i class="bi bi-circle-fill me-1"></i>
            Online
          </span>
        </BNavItem>

      </BNavbarNav>
    </BCollapse>
  </BNavbar>
</template>

<style scoped>
/* Fixed high-contrast top bar. variant="dark" alone leaves the text
   unreadable against the page in dark mode, so pin the background and
   text explicitly - this reads well in both light and dark themes. */
.navbar {
  background-color: #1f2028;
  border-bottom: 1px solid #2e303a;
}

.navbar :deep(.navbar-brand),
.navbar :deep(.nav-link),
.navbar :deep(.nav-item) {
  color: #f3f4f6;
}

.navbar :deep(.nav-link:hover),
.navbar :deep(.nav-link.active),
.navbar :deep(.router-link-active),
.navbar :deep(.navbar-brand:hover) {
  color: #c084fc;
}

.navbar :deep(.navbar-toggler) {
  border-color: #2e303a;
  color: #f3f4f6;
}
</style>