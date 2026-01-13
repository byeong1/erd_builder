<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useErdStore } from '@/stores/erd'
import type { Entity, PendingRelation, NewRelation } from '@/types'

const props = defineProps<{
  show: boolean
  entity?: Entity | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { t, locale } = useI18n()
const store = useErdStore()

const colorPalette = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#64748b', '#1f2937'
]

const state = reactive({
  tab: 'basic' as 'basic' | 'relations',
  data: {
    name: '',
    entityType: 'parent',
    color: '#6366f1',
    description: ''
  }
})

const pendingRelations = reactive({
  existing: [] as Array<{ id: number; from: number; to: number; cardinality: string }>,
  toDelete: [] as number[],
  toAdd: [] as PendingRelation[]
})

const newRel = reactive<NewRelation>({
  direction: 'to',
  targetId: '',
  cardinality: '1:N',
  label: '',
  fkColumnName: '',
  refColumn: '',
  fkNullable: false
})

const isEdit = computed(() => !!props.entity)

watch(() => props.show, (show) => {
  if (show) {
    resetNewRel()
    pendingRelations.toDelete = []
    pendingRelations.toAdd = []

    if (props.entity) {
      state.tab = 'basic'
      state.data = {
        name: props.entity.name,
        entityType: props.entity.entityType,
        color: props.entity.color,
        description: props.entity.description || ''
      }
      pendingRelations.existing = store.getRelationsForEntity(props.entity.id).map(r => ({
        id: r.id,
        from: r.from,
        to: r.to,
        cardinality: r.cardinality
      }))
    } else {
      state.tab = 'basic'
      const dt = store.entityTypes[0]
      state.data = {
        name: '',
        entityType: dt.id,
        color: dt.color,
        description: ''
      }
      pendingRelations.existing = []
    }
  }
})

const resetNewRel = () => {
  Object.assign(newRel, {
    direction: 'to',
    targetId: '',
    cardinality: '1:N',
    label: '',
    fkColumnName: '',
    refColumn: '',
    fkNullable: false
  })
}

const selectEntityType = (tp: (typeof store.entityTypes)[number]) => {
  state.data.entityType = tp.id
  state.data.color = tp.color
}

const hasPendingChanges = () => pendingRelations.toDelete.length > 0 || pendingRelations.toAdd.length > 0

const closeModal = () => {
  if (hasPendingChanges() && !confirm(t('confirmUnsaved'))) return
  emit('close')
}

const getEntityNameSafe = (id: number): string => {
  if (id === props.entity?.id) return state.data.name
  return store.getEntityName(id)
}

const getOtherEntities = () => store.entities.filter(e => e.id !== props.entity?.id)

const getFkTargetEntityId = (): number | null => {
  if (!newRel.targetId) return null
  const card = newRel.cardinality
  if (newRel.direction === 'from') {
    return (card === '1:N' || card === '1:1') ? +newRel.targetId : props.entity?.id || null
  }
  return (card === '1:N' || card === '1:1') ? props.entity?.id || null : +newRel.targetId
}

const getRefEntityId = (): number | null => {
  if (!newRel.targetId) return null
  const card = newRel.cardinality
  if (newRel.direction === 'from') {
    return (card === '1:N' || card === '1:1') ? props.entity?.id || null : +newRel.targetId
  }
  return (card === '1:N' || card === '1:1') ? +newRel.targetId : props.entity?.id || null
}

const getFkTargetTableName = () => {
  const id = getFkTargetEntityId()
  return id ? getEntityNameSafe(id) : ''
}

const getRefTableName = () => {
  const id = getRefEntityId()
  return id ? getEntityNameSafe(id) : ''
}

const getRefColumns = () => {
  const refId = getRefEntityId()
  if (!refId) return []
  const e = store.getEntityById(refId)
  return e ? e.attributes.filter(a => a.pk || a.unique) : []
}

const getDefaultFkColumnName = (): string => {
  const refId = getRefEntityId()
  if (!refId) return ''
  const refEntity = store.getEntityById(refId)
  if (!refEntity) return ''
  const pk = refEntity.attributes.find(a => a.pk)
  return pk ? `${refEntity.name.toLowerCase()}_${pk.name}` : ''
}

const onTargetChange = () => {
  newRel.fkColumnName = ''
  const cols = getRefColumns()
  newRel.refColumn = cols.length ? cols[0].name : ''
}

const addPendingRelation = () => {
  if (!newRel.targetId || !newRel.refColumn) return

  const fromId = newRel.direction === 'from' ? props.entity?.id! : +newRel.targetId
  const toId = newRel.direction === 'from' ? +newRel.targetId : props.entity?.id!

  const existsInCurrent = pendingRelations.existing.some(r =>
    !pendingRelations.toDelete.includes(r.id) &&
    ((r.from === fromId && r.to === toId) || (r.from === toId && r.to === fromId))
  )

  const existsInPending = pendingRelations.toAdd.some(r =>
    (r.fromId === fromId && r.toId === toId) || (r.fromId === toId && r.toId === fromId)
  )

  if (existsInCurrent || existsInPending) {
    alert(t('relationExists'))
    return
  }

  const fkTargetId = getFkTargetEntityId()!
  const refId = getRefEntityId()
  const refEntity = store.getEntityById(refId!)
  const refCol = refEntity?.attributes.find(a => a.name === newRel.refColumn)

  pendingRelations.toAdd.push({
    fromId,
    toId,
    cardinality: newRel.cardinality,
    label: newRel.label,
    fkTargetEntityId: fkTargetId,
    fkColumnName: newRel.fkColumnName || getDefaultFkColumnName(),
    fkColumnType: refCol?.type || 'INT',
    fkColumnLength: refCol?.length || '',
    fkColumnUnsigned: refCol?.unsigned || false,
    refTable: refEntity?.name || '',
    refColumn: newRel.refColumn,
    fkNullable: newRel.fkNullable
  })

  resetNewRel()
}

const saveEntity = () => {
  if (!state.data.name.trim()) {
    alert(t('entityNameRequired'))
    return
  }

  if (isEdit.value && props.entity) {
    store.updateEntity(props.entity.id, {
      name: state.data.name,
      entityType: state.data.entityType,
      color: state.data.color,
      description: state.data.description
    })

    // Delete relations
    pendingRelations.toDelete.forEach(relId => store.deleteRelation(relId))

    // Add new relations
    pendingRelations.toAdd.forEach(rel => {
      const fkTargetEntity = store.getEntityById(rel.fkTargetEntityId)
      if (fkTargetEntity) {
        fkTargetEntity.attributes.push({
          id: store.getNextId(),
          name: rel.fkColumnName,
          type: rel.fkColumnType,
          length: rel.fkColumnLength,
          pk: false,
          fk: true,
          nn: !rel.fkNullable,
          unique: false,
          unsigned: rel.fkColumnUnsigned,
          autoIncrement: false,
          defaultValue: '',
          charset: '',
          comment: '',
          fkRef: { table: rel.refTable, column: rel.refColumn }
        })
      }

      store.addRelation({
        from: rel.fromId,
        to: rel.toId,
        cardinality: rel.cardinality,
        label: rel.label,
        fkColumn: rel.fkColumnName,
        fkTargetEntityId: rel.fkTargetEntityId
      })
    })
  } else {
    store.addEntity({
      name: state.data.name,
      x: 50 + (store.entities.length % 3) * 280,
      y: 50 + Math.floor(store.entities.length / 3) * 220,
      entityType: state.data.entityType,
      color: state.data.color,
      description: state.data.description
    })
  }

  emit('saved')
  emit('close')
}

const deleteEntityFromModal = () => {
  if (confirm(t('confirmDeleteEntity'))) {
    store.deleteEntity(props.entity!.id)
    emit('close')
  }
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-lg w-full max-w-xl"
      @click.stop
      style="max-height: 90vh; display: flex; flex-direction: column"
    >
      <!-- Header -->
      <div class="flex justify-between items-center px-5 pt-4 pb-2">
        <span class="font-bold text-gray-800">
          {{ isEdit ? t('editEntity') : t('newEntity') }}
        </span>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-xl">
          &times;
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b px-5">
        <div
          @click="state.tab = 'basic'"
          :class="['tab-btn', state.tab === 'basic' ? 'active' : 'text-gray-500']"
        >
          {{ t('basicInfo') }}
        </div>
        <div
          v-if="isEdit"
          @click="state.tab = 'relations'"
          :class="['tab-btn', state.tab === 'relations' ? 'active' : 'text-gray-500']"
        >
          {{ t('relationSettings') }}
          <span v-if="hasPendingChanges()" class="pending-badge bg-orange-100 text-orange-600">
            {{ t('changed') }}
          </span>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-5">
        <!-- Basic Tab -->
        <div v-if="state.tab === 'basic'">
          <div class="modal-section">
            <label class="modal-label">{{ t('entityName') }} *</label>
            <input
              v-model="state.data.name"
              class="modal-input"
              :placeholder="t('tableName')"
            />
          </div>

          <div class="modal-section">
            <label class="modal-label">{{ t('entityType') }}</label>
            <div class="grid grid-cols-4 gap-2 mt-2">
              <div
                v-for="tp in store.entityTypes"
                :key="tp.id"
                @click="selectEntityType(tp)"
                :class="[
                  'entity-type-card text-center',
                  state.data.entityType === tp.id ? 'selected' : ''
                ]"
              >
                <div class="w-4 h-4 rounded mx-auto mb-1" :style="{ background: tp.color }"></div>
                <div>{{ tp.name[locale as 'ko' | 'en'] }}</div>
              </div>
            </div>
          </div>

          <div class="modal-section">
            <label class="modal-label">{{ t('headerColor') }}</label>
            <div class="flex items-center gap-2 mt-2">
              <div
                v-for="c in colorPalette"
                :key="c"
                @click="state.data.color = c"
                :class="['color-preset', state.data.color === c ? 'selected' : '']"
                :style="{ background: c }"
              ></div>
              <input
                type="color"
                v-model="state.data.color"
                class="w-6 h-6 rounded cursor-pointer border-0 ml-2"
              />
            </div>
          </div>

          <div class="modal-section">
            <label class="modal-label">{{ t('description') }}</label>
            <textarea
              v-model="state.data.description"
              class="modal-input h-14 resize-none"
              :placeholder="t('tableDesc')"
            ></textarea>
          </div>
        </div>

        <!-- Relations Tab -->
        <div v-if="state.tab === 'relations'">
          <div class="modal-section">
            <label class="modal-label">{{ t('currentRelations') }}</label>
            <div
              v-if="pendingRelations.existing.length === 0 && pendingRelations.toAdd.length === 0"
              class="text-xs text-gray-400 py-3 text-center border rounded mt-2"
            >
              {{ t('noRelations') }}
            </div>
            <div v-else class="mt-2">
              <!-- Existing relations -->
              <div
                v-for="rel in pendingRelations.existing"
                :key="'e' + rel.id"
                :class="[
                  'relation-item',
                  pendingRelations.toDelete.includes(rel.id) ? 'pending-delete' : ''
                ]"
              >
                <div class="flex items-center gap-2">
                  <span :class="rel.from === entity?.id ? 'text-blue-600 font-medium' : 'text-gray-600'">
                    {{ getEntityNameSafe(rel.from) }}
                  </span>
                  <span class="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
                    {{ rel.cardinality }}
                  </span>
                  <span :class="rel.to === entity?.id ? 'text-blue-600 font-medium' : 'text-gray-600'">
                    {{ getEntityNameSafe(rel.to) }}
                  </span>
                  <span
                    v-if="pendingRelations.toDelete.includes(rel.id)"
                    class="pending-badge bg-red-100 text-red-600"
                  >
                    {{ t('pendingDelete') }}
                  </span>
                </div>
                <button
                  v-if="!pendingRelations.toDelete.includes(rel.id)"
                  @click="pendingRelations.toDelete.push(rel.id)"
                  class="text-red-400 hover:text-red-600 text-sm"
                >
                  {{ t('delete') }}
                </button>
                <button
                  v-else
                  @click="pendingRelations.toDelete = pendingRelations.toDelete.filter(id => id !== rel.id)"
                  class="text-blue-500 hover:text-blue-700 text-sm"
                >
                  {{ t('cancel') }}
                </button>
              </div>

              <!-- Pending add relations -->
              <div
                v-for="(rel, idx) in pendingRelations.toAdd"
                :key="'a' + idx"
                class="relation-item pending-add"
              >
                <div class="flex items-center gap-2">
                  <span :class="rel.fromId === entity?.id ? 'text-blue-600 font-medium' : 'text-gray-600'">
                    {{ getEntityNameSafe(rel.fromId) }}
                  </span>
                  <span class="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
                    {{ rel.cardinality }}
                  </span>
                  <span :class="rel.toId === entity?.id ? 'text-blue-600 font-medium' : 'text-gray-600'">
                    {{ getEntityNameSafe(rel.toId) }}
                  </span>
                  <span class="pending-badge bg-green-100 text-green-600">
                    {{ t('pendingAdd') }}
                  </span>
                </div>
                <button
                  @click="pendingRelations.toAdd.splice(idx, 1)"
                  class="text-red-400 hover:text-red-600 text-sm"
                >
                  {{ t('cancel') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Add New Relation -->
          <div class="modal-section border-t pt-4 mt-4">
            <label class="modal-label">{{ t('addNewRelation') }}</label>
            <div class="mt-3 p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-2 mb-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="newRel.direction" value="from" />
                  <span class="text-xs">{{ t('thisToOther') }}</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer ml-4">
                  <input type="radio" v-model="newRel.direction" value="to" />
                  <span class="text-xs">{{ t('otherToThis') }}</span>
                </label>
              </div>

              <div class="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <label class="modal-label">{{ t('targetEntity') }}</label>
                  <select v-model="newRel.targetId" class="modal-input" @change="onTargetChange">
                    <option value="">{{ t('select') }}...</option>
                    <option v-for="e in getOtherEntities()" :key="e.id" :value="e.id">
                      {{ e.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="modal-label">{{ t('cardinality') }}</label>
                  <select v-model="newRel.cardinality" class="modal-input" @change="onTargetChange">
                    <option value="1:1">1:1</option>
                    <option value="1:N">1:N</option>
                    <option value="N:1">N:1</option>
                    <option value="N:M">N:M</option>
                  </select>
                </div>
                <div>
                  <label class="modal-label">{{ t('relationName') }}</label>
                  <input v-model="newRel.label" class="modal-input" :placeholder="t('optional')" />
                </div>
              </div>

              <div v-if="newRel.targetId" class="border-t pt-3 mt-3">
                <label class="modal-label">{{ t('fkColumnSettings') }}</label>
                <div class="bg-white border rounded p-3">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-medium">{{ t('fkTargetTable') }}:</span>
                    <span class="text-xs text-blue-600 font-medium">{{ getFkTargetTableName() }}</span>
                  </div>
                  <div class="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label class="modal-label">{{ t('fkColumnName') }}</label>
                      <input
                        v-model="newRel.fkColumnName"
                        class="modal-input"
                        :placeholder="getDefaultFkColumnName()"
                      />
                    </div>
                    <div>
                      <label class="modal-label">{{ t('refColumn') }}</label>
                      <select v-model="newRel.refColumn" class="modal-input">
                        <option v-for="col in getRefColumns()" :key="col.id" :value="col.name">
                          {{ col.name }} ({{ col.type }})
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="flex items-center gap-4 mb-2">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="newRel.fkNullable" />
                      {{ t('allowNull') }}
                    </label>
                  </div>
                  <div class="p-2 bg-gray-50 rounded text-xs text-gray-600">
                    {{ t('preview') }}:
                    <span class="font-medium">{{ getFkTargetTableName() }}</span>.
                    <span class="text-blue-600">{{ newRel.fkColumnName || getDefaultFkColumnName() }}</span>
                    →
                    <span class="font-medium">{{ getRefTableName() }}</span>.
                    <span class="text-green-600">{{ newRel.refColumn }}</span>
                    <span v-if="newRel.fkNullable" class="text-orange-500 ml-1">(NULLABLE)</span>
                  </div>
                </div>
              </div>

              <button
                @click="addPendingRelation"
                :disabled="!newRel.targetId || !newRel.refColumn"
                :class="[
                  'w-full py-2 rounded text-xs text-white mt-3',
                  newRel.targetId && newRel.refColumn
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-300 cursor-not-allowed'
                ]"
              >
                {{ t('addRelation') }}
              </button>
            </div>
          </div>

          <div
            v-if="hasPendingChanges()"
            class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800"
          >
            {{ t('pendingChangesMsg') }}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-between p-4 border-t">
        <button
          v-if="isEdit"
          @click="deleteEntityFromModal"
          class="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
        >
          {{ t('deleteEntity') }}
        </button>
        <div v-else></div>
        <div class="flex gap-2">
          <button
            @click="closeModal"
            class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            {{ t('cancel') }}
          </button>
          <button
            @click="saveEntity"
            class="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {{ isEdit ? t('save') : t('create') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
