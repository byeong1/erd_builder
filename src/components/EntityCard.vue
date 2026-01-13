<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Entity, Attribute, AttrDragState } from '@/types'
import { useErdStore } from '@/stores/erd'

const props = defineProps<{
  entity: Entity
  isSelected: boolean
  attrDrag: AttrDragState
  hoverAttr: { eid: number; aid: number } | null
}>()

const emit = defineEmits<{
  select: []
  startDrag: [event: MouseEvent]
  openEntityModal: []
  openAttrModal: [attr: Attribute]
  addAttr: []
  deleteAttr: [attrId: number]
  attrDragStart: [event: DragEvent, attrIndex: number, attrId: number]
  attrDragEnd: []
  attrDragOver: [event: DragEvent, attrIndex: number]
  attrDrop: [event: DragEvent]
  hoverAttrChange: [value: { eid: number; aid: number } | null]
}>()

const { t } = useI18n()
const store = useErdStore()

const getTypeDisplay = (attr: Attribute): string => {
  let tp = attr.type
  if (attr.length) tp += `(${attr.length})`
  return tp
}

const isDraggingAttr = (attrId: number) => {
  return props.attrDrag.dragging &&
         props.attrDrag.sourceEntityId === props.entity.id &&
         props.attrDrag.draggedAttrId === attrId
}

const isHovering = (attrId: number) => {
  return props.hoverAttr?.eid === props.entity.id && props.hoverAttr?.aid === attrId
}
</script>

<template>
  <div
    :class="[
      'absolute bg-white border-2 rounded-lg shadow-lg select-none entity-card',
      isSelected ? 'border-blue-500' : 'border-gray-300'
    ]"
    :style="{ left: entity.x + 'px', top: entity.y + 'px' }"
    @click.stop="emit('select')"
  >
    <!-- Header -->
    <div
      class="text-white px-3 py-2 rounded-t-md text-xs flex items-center justify-between cursor-move"
      :style="{ background: entity.color }"
      @mousedown="emit('startDrag', $event)"
    >
      <span @dblclick.stop="emit('openEntityModal')">{{ entity.name }}</span>
      <div class="flex items-center gap-1">
        <button
          @click.stop="emit('openEntityModal')"
          class="hover:bg-white hover:bg-opacity-20 rounded px-1"
        >
          {{ t('settings') }}
        </button>
        <button
          @click.stop="emit('addAttr')"
          class="hover:bg-white hover:bg-opacity-20 rounded px-1"
        >
          +
        </button>
      </div>
    </div>

    <!-- Attributes -->
    <div class="divide-y text-xs">
      <div
        v-for="(attr, attrIdx) in entity.attributes"
        :key="attr.id"
        :class="[
          'px-2 py-1.5 attr-row cursor-pointer relative',
          isDraggingAttr(attr.id) ? 'dragging' : ''
        ]"
        draggable="true"
        @click.stop="emit('openAttrModal', attr)"
        @mouseenter="emit('hoverAttrChange', { eid: entity.id, aid: attr.id })"
        @mouseleave="emit('hoverAttrChange', null)"
        @dragstart="emit('attrDragStart', $event, attrIdx, attr.id)"
        @dragend="emit('attrDragEnd')"
        @dragover="emit('attrDragOver', $event, attrIdx)"
        @drop="emit('attrDrop', $event)"
      >
        <div class="flex items-center gap-1">
          <span class="drag-handle" @mousedown.stop>⋮⋮</span>
          <span class="w-6 flex gap-0.5">
            <span v-if="attr.pk" class="key-icon pk-icon">PK</span>
            <span v-if="attr.fk" class="key-icon fk-icon">FK</span>
          </span>
          <span :class="{ 'font-bold': attr.pk }" class="flex-1 truncate">
            {{ attr.name }}
          </span>
          <span class="text-gray-400 truncate text-right">
            {{ getTypeDisplay(attr) }}
          </span>
          <div class="attr-actions ml-1">
            <button
              @click.stop="emit('deleteAttr', attr.id)"
              class="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>

        <!-- Badges -->
        <div
          v-if="store.showBadges && (attr.nn || attr.unique || attr.autoIncrement || attr.unsigned)"
          class="flex flex-wrap gap-1 mt-1 ml-6"
        >
          <span v-if="attr.unsigned" class="badge bg-purple-100 text-purple-700">UN</span>
          <span v-if="attr.nn" class="badge bg-orange-100 text-orange-700">NN</span>
          <span v-if="attr.unique" class="badge bg-green-100 text-green-700">UQ</span>
          <span v-if="attr.autoIncrement" class="badge bg-pink-100 text-pink-700">AI</span>
        </div>

        <!-- Tooltip -->
        <div
          v-if="isHovering(attr.id) && !attrDrag.dragging"
          class="tooltip"
        >
          <div><b>{{ attr.name }}</b> {{ getTypeDisplay(attr) }}</div>
          <div v-if="attr.fkRef?.table">→ {{ attr.fkRef.table }}.{{ attr.fkRef.column }}</div>
          <div v-if="attr.comment">{{ attr.comment }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
