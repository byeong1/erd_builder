<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useErdStore } from '@/stores/erd'

const emit = defineEmits<{
  openColorSettings: []
  openSqlModal: []
}>()

const { t, locale } = useI18n()
const store = useErdStore()

const setLocale = (lang: 'ko' | 'en') => {
  locale.value = lang
}
</script>

<template>
  <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between">
    <span class="font-bold">ERD Builder Pro</span>
    <div class="flex gap-2 items-center">
      <div class="flex border border-white border-opacity-30 rounded overflow-hidden mr-2">
        <button
          @click="setLocale('ko')"
          :class="['lang-btn', locale === 'ko' ? 'active' : '']"
        >
          한국어
        </button>
        <button
          @click="setLocale('en')"
          :class="['lang-btn', locale === 'en' ? 'active' : '']"
        >
          EN
        </button>
      </div>
      <button
        @click="emit('openColorSettings')"
        class="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded text-xs"
      >
        {{ t('colorSettings') }}
      </button>
      <label class="flex items-center gap-1 text-xs cursor-pointer">
        <input type="checkbox" v-model="store.showBadges" />
        {{ t('badge') }}
      </label>
      <button
        @click="emit('openSqlModal')"
        class="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded text-xs"
      >
        {{ t('viewSql') }}
      </button>
    </div>
  </div>
</template>
