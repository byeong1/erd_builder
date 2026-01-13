<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useErdStore } from '@/stores/erd'
import type { Entity } from '@/types'

const emit = defineEmits<{
  openEntityModal: [entity?: Entity]
}>()

const { t, locale } = useI18n()
const store = useErdStore()

const getEntityTypeName = (typeId: string): string => {
  const tp = store.entityTypes.find(x => x.id === typeId)
  return tp ? tp.name[locale.value as 'ko' | 'en'] : ''
}
</script>

<template>
  <div class="w-52 bg-white border-r flex flex-col">
    <div class="p-3 border-b">
      <button
        @click="emit('openEntityModal')"
        class="w-full bg-blue-500 text-white py-2 rounded text-xs hover:bg-blue-600"
      >
        + {{ t('addEntity') }}
      </button>
    </div>
    <div class="flex-1 overflow-y-auto p-2">
      <div
        v-for="entity in store.entities"
        :key="entity.id"
        :class="[
          'border rounded p-2 mb-2 cursor-pointer',
          store.selectedEntityId === entity.id
            ? 'border-blue-500 bg-blue-50'
            : 'hover:bg-gray-50'
        ]"
        @click="store.selectedEntityId = entity.id"
        @dblclick="emit('openEntityModal', entity)"
      >
        <div class="flex items-center gap-2">
          <span
            class="w-3 h-3 rounded"
            :style="{ background: entity.color }"
          ></span>
          <span class="font-medium text-gray-800 text-xs">{{ entity.name }}</span>
        </div>
        <div class="text-xs text-gray-400 mt-1 ml-5">
          {{ getEntityTypeName(entity.entityType) }}
        </div>
      </div>
    </div>
  </div>
</template>
