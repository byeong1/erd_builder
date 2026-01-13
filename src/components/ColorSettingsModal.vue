<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useErdStore } from '@/stores/erd'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { t, locale } = useI18n()
const store = useErdStore()

const colorPalette = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#64748b', '#1f2937'
]
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="emit('close')"
  >
    <div class="bg-white rounded-lg w-full max-w-md p-5" @click.stop>
      <div class="flex justify-between items-center mb-4">
        <span class="font-bold">{{ t('entityTypeColor') }}</span>
        <button @click="emit('close')" class="text-gray-400 text-xl">&times;</button>
      </div>
      <div class="space-y-3">
        <div
          v-for="tp in store.entityTypes"
          :key="tp.id"
          class="flex items-center justify-between p-2 border rounded"
        >
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded" :style="{ background: tp.color }"></span>
            <span class="text-sm">{{ tp.name[locale as 'ko' | 'en'] }}</span>
          </div>
          <div class="flex items-center gap-1">
            <div
              v-for="c in colorPalette.slice(0, 6)"
              :key="c"
              @click="tp.color = c"
              :class="['w-5 h-5 rounded cursor-pointer border', tp.color === c ? 'border-gray-800' : 'border-transparent']"
              :style="{ background: c }"
            ></div>
            <input
              type="color"
              v-model="tp.color"
              class="w-5 h-5 rounded cursor-pointer border-0"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
