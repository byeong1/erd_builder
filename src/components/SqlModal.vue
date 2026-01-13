<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSqlGenerator } from '@/composables/useSqlGenerator'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const { includeComments, generatedSQL, copySQL, downloadSQL } = useSqlGenerator()

const handleCopy = async () => {
  await copySQL()
  alert(t('copied'))
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="emit('close')"
  >
    <div
      class="bg-white rounded-lg w-3/4 flex flex-col"
      style="max-height: 85vh"
      @click.stop
    >
      <div class="flex justify-between items-center px-4 py-3 border-b">
        <span class="font-bold">SQL DDL</span>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-1 text-xs">
            <input type="checkbox" v-model="includeComments" />
            {{ t('comment') }}
          </label>
          <button @click="emit('close')" class="text-xl">&times;</button>
        </div>
      </div>
      <pre class="flex-1 overflow-auto p-4 bg-gray-900 text-green-400 text-xs font-mono whitespace-pre-wrap">{{ generatedSQL }}</pre>
      <div class="p-3 border-t flex justify-end gap-2">
        <button
          @click="downloadSQL"
          class="bg-gray-500 text-white px-4 py-2 rounded text-sm"
        >
          {{ t('download') }}
        </button>
        <button
          @click="handleCopy"
          class="bg-blue-500 text-white px-4 py-2 rounded text-sm"
        >
          {{ t('copy') }}
        </button>
      </div>
    </div>
  </div>
</template>
