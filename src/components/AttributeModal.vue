<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useErdStore } from '@/stores/erd'
import type { Attribute } from '@/types'

const props = defineProps<{
  show: boolean
  entityId: number | null
  attribute: Attribute | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
  deleted: []
}>()

const { t } = useI18n()
const store = useErdStore()

const data = reactive<Attribute>({
  id: 0,
  name: '',
  type: 'VARCHAR',
  length: '',
  pk: false,
  fk: false,
  nn: false,
  unique: false,
  unsigned: false,
  autoIncrement: false,
  defaultValue: '',
  charset: '',
  comment: '',
  fkRef: { table: '', column: '' }
})

watch(() => props.show, (show) => {
  if (show && props.attribute) {
    Object.assign(data, {
      ...props.attribute,
      fkRef: { ...props.attribute.fkRef }
    })
  }
})

const getFkRefColumns = () => {
  if (!data.fkRef?.table) return []
  const entity = store.entities.find(e => e.name === data.fkRef.table)
  return entity ? entity.attributes : []
}

const save = () => {
  if (props.entityId && props.attribute) {
    store.updateAttribute(props.entityId, props.attribute.id, { ...data })
  }
  emit('saved')
  emit('close')
}

const deleteAttr = () => {
  if (props.entityId && props.attribute) {
    store.deleteAttribute(props.entityId, props.attribute.id)
  }
  emit('deleted')
  emit('close')
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="emit('close')"
  >
    <div class="bg-white rounded-lg w-full max-w-md p-4" @click.stop>
      <div class="flex justify-between items-center mb-4">
        <span class="font-bold">{{ t('columnProperties') }}</span>
        <button @click="emit('close')" class="text-gray-400 text-xl">&times;</button>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="modal-section col-span-2">
          <label class="modal-label">{{ t('columnName') }}</label>
          <input v-model="data.name" class="modal-input" />
        </div>

        <div class="modal-section">
          <label class="modal-label">{{ t('type') }}</label>
          <select v-model="data.type" class="modal-input">
            <optgroup :label="t('numbers')">
              <option>TINYINT</option>
              <option>SMALLINT</option>
              <option>INT</option>
              <option>BIGINT</option>
              <option>DECIMAL</option>
              <option>FLOAT</option>
              <option>DOUBLE</option>
            </optgroup>
            <optgroup :label="t('strings')">
              <option>CHAR</option>
              <option>VARCHAR</option>
              <option>TEXT</option>
              <option>MEDIUMTEXT</option>
              <option>LONGTEXT</option>
            </optgroup>
            <optgroup :label="t('datetime')">
              <option>DATE</option>
              <option>TIME</option>
              <option>DATETIME</option>
              <option>TIMESTAMP</option>
            </optgroup>
            <optgroup :label="t('others')">
              <option>BOOLEAN</option>
              <option>ENUM</option>
              <option>JSON</option>
              <option>BLOB</option>
            </optgroup>
          </select>
        </div>

        <div class="modal-section">
          <label class="modal-label">{{ t('length') }}</label>
          <input v-model="data.length" class="modal-input" placeholder="255" />
        </div>

        <div class="modal-section">
          <label class="modal-label">{{ t('defaultValue') }}</label>
          <input v-model="data.defaultValue" class="modal-input" />
        </div>

        <div class="modal-section">
          <label class="modal-label">Charset</label>
          <select v-model="data.charset" class="modal-input">
            <option value="">-</option>
            <option>utf8</option>
            <option>utf8mb4</option>
          </select>
        </div>

        <div class="modal-section col-span-2">
          <label class="modal-label">{{ t('constraints') }}</label>
          <div class="flex flex-wrap gap-2 mt-1">
            <button
              @click="data.pk = !data.pk"
              :class="['toggle-btn', data.pk ? 'toggle-on' : 'toggle-off']"
            >
              PK<span class="toggle-tooltip">{{ t('pkTooltip') }}</span>
            </button>
            <button
              @click="data.fk = !data.fk"
              :class="['toggle-btn', data.fk ? 'toggle-on' : 'toggle-off']"
            >
              FK<span class="toggle-tooltip">{{ t('fkTooltip') }}</span>
            </button>
            <button
              @click="data.nn = !data.nn"
              :class="['toggle-btn', data.nn ? 'toggle-on' : 'toggle-off']"
            >
              NN<span class="toggle-tooltip">{{ t('nnTooltip') }}</span>
            </button>
            <button
              @click="data.unique = !data.unique"
              :class="['toggle-btn', data.unique ? 'toggle-on' : 'toggle-off']"
            >
              UQ<span class="toggle-tooltip">{{ t('uqTooltip') }}</span>
            </button>
            <button
              @click="data.unsigned = !data.unsigned"
              :class="['toggle-btn', data.unsigned ? 'toggle-on' : 'toggle-off']"
            >
              UN<span class="toggle-tooltip">{{ t('unTooltip') }}</span>
            </button>
            <button
              @click="data.autoIncrement = !data.autoIncrement"
              :class="['toggle-btn', data.autoIncrement ? 'toggle-on' : 'toggle-off']"
            >
              AI<span class="toggle-tooltip">{{ t('aiTooltip') }}</span>
            </button>
          </div>
        </div>

        <div v-if="data.fk" class="modal-section col-span-2">
          <label class="modal-label">{{ t('fkReference') }}</label>
          <div class="flex gap-2">
            <select v-model="data.fkRef.table" class="modal-input">
              <option value="">{{ t('table') }}</option>
              <option v-for="e in store.entities" :key="e.id" :value="e.name">
                {{ e.name }}
              </option>
            </select>
            <select v-model="data.fkRef.column" class="modal-input">
              <option value="">{{ t('column') }}</option>
              <option v-for="a in getFkRefColumns()" :key="a.id" :value="a.name">
                {{ a.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="modal-section col-span-2">
          <label class="modal-label">{{ t('comment') }}</label>
          <textarea v-model="data.comment" class="modal-input h-12 resize-none"></textarea>
        </div>
      </div>

      <div class="flex justify-between mt-4">
        <button
          @click="deleteAttr"
          class="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
        >
          {{ t('delete') }}
        </button>
        <div class="flex gap-2">
          <button
            @click="emit('close')"
            class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            {{ t('cancel') }}
          </button>
          <button
            @click="save"
            class="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {{ t('save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
