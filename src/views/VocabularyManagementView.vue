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
  BButton,
  BTable,
  BRow,
} from "bootstrap-vue-next";
import vocabStore from "../stores/vocabStore";
import { computed, ref } from "vue";

const store = vocabStore();

const vocabFileInput = ref<File | null>();
const vocabFiles = ref<FileList | null>();
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
const fileToUpload = ref("");
const filesToCompile = ref<string[]>([]);

const vocabProperties = computed(() => store.vocabularyPropertiesResponse?.data);

const compileFiles = () => {
  store.CompileVocabFiles(filesToCompile.value);
};

const uploadFile = () => {
  store.UploadVocabFile(fileToUpload.value);
};

const getVocabProps = () => {
  store.GetVocabProperties();
};
</script>

<template>
  <BContainer fluid class="py-4">
    <BCard>
      <BCardHeader>
        <div class="d-flex justify-content-between align-items-center">
          <h3 class="mb-0">Vocabulary Management</h3>
        </div>
      </BCardHeader>

      <BCardBody>
        <BTabs>
          <!-- Upload -->
          <BTab title="Upload files">
            <BForm @submit.prevent="uploadFile">
              <BFormGroup label="File to upload" label-for="vocab-file" class="mb-3">
                <BFormFile
                  id="vocab-file"
                  v-model="vocabFileInput"
                  accept=".txt"
                  browse-text="Browse"
                />
              </BFormGroup>

              <BButton type="submit" variant="primary"> Upload </BButton>
            </BForm>
          </BTab>

          <!-- Compile -->
          <BTab title="Compile files">
            <BForm @submit.prevent="compileFiles">
              <BFormGroup label="Files to compile" label-for="files" class="mb-3">
                <BTable
                  :items="store.filesToCompile"
                  :fields="[{ key: 'name', label: 'Name' }]"
                  responsive
                  striped
                  hover
                />
              </BFormGroup>

              <BButton type="submit" variant="primary"> Compile </BButton>
            </BForm>
          </BTab>

          <!-- Vocabulary information -->
          <BTab title="Vocabulary properties">
            <BTable
              :items="vocabPropertyRows"
              :fields="vocabPropertyFields"
              responsive
              striped
              hover
            />

            <BButton variant="secondary" @click="getVocabProps"> Refresh </BButton>
          </BTab>
        </BTabs>
      </BCardBody>
    </BCard>
  </BContainer>
</template>
