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
  <BNavbar toggleable="lg" variant="dark">
    <BNavbarBrand variant="light" :to="{ name: 'home' }">
      Simple Transformer - Frontend
    </BNavbarBrand>

    <BNavbarToggle target="main-navbar">
      <i class="bi bi-list"></i>
    </BNavbarToggle>

    <BCollapse id="main-navbar" is-nav>
      <BNavbarNav>
        <BNavItem variant="light" :to="{ name: 'home' }"> Home </BNavItem>

        <BNavItem variant="light" :to="{ name: 'infer' }"> Infer </BNavItem>

        <BNavItem variant="light" :to="{ name: 'train' }"> Train </BNavItem>

        <BNavItem variant="light" :to="{ name: 'vocab' }"> Vocabulary </BNavItem>
      </BNavbarNav>
    </BCollapse>
  </BNavbar>
</template>

<style scoped>
#main-navbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  color: #ddd;
}
</style>
