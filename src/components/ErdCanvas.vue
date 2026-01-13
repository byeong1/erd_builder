<script setup lang="ts">
import { ref } from 'vue'
import { useErdStore } from '@/stores/erd'
import { useEntityDrag } from '@/composables/useEntityDrag'
import { useAttributeDrag } from '@/composables/useAttributeDrag'
import { useRelationPath } from '@/composables/useRelationPath'
import EntityCard from './EntityCard.vue'
import type { Entity, Attribute } from '@/types'

const emit = defineEmits<{
  openEntityModal: [entity: Entity]
  openAttrModal: [entityId: number, attr: Attribute]
}>()

const store = useErdStore()
const canvas = ref<HTMLElement | null>(null)

const { onMouseDown, onMouseMove, onMouseUp } = useEntityDrag()
const { attrDrag, onDragStart, onDragEnd, onDragOver, onDrop } = useAttributeDrag()
const { getRelationPath, getCrowsFoot } = useRelationPath()

const hoverAttr = ref<{ eid: number; aid: number } | null>(null)

const handleEntityMouseDown = (event: MouseEvent, entity: Entity) => {
  if (!canvas.value) return
  onMouseDown(event, entity, canvas.value.getBoundingClientRect())
}

const handleMouseMove = (event: MouseEvent) => {
  if (!canvas.value) return
  onMouseMove(event, canvas.value.getBoundingClientRect())
}

const handleAddAttr = (entityId: number) => {
  const newAttr = store.addAttribute(entityId)
  if (newAttr) {
    emit('openAttrModal', entityId, newAttr)
  }
}
</script>

<template>
  <div
    ref="canvas"
    class="flex-1 overflow-auto bg-gray-50 relative grid-bg"
    style="min-height: 600px"
    @mousemove="handleMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  >
    <!-- Relation Lines -->
    <svg
      class="absolute inset-0 w-full h-full pointer-events-none"
      style="min-width: 1400px; min-height: 900px"
    >
      <g v-for="rel in store.relations" :key="'l' + rel.id">
        <path
          :d="getRelationPath(rel)"
          stroke="#6366f1"
          stroke-width="2"
          fill="none"
        />
        <path
          v-for="(p, i) in getCrowsFoot(rel, 'from')"
          :key="'f' + i"
          :d="p"
          stroke="#6366f1"
          stroke-width="2"
          fill="none"
        />
        <path
          v-for="(p, i) in getCrowsFoot(rel, 'to')"
          :key="'t' + i"
          :d="p"
          stroke="#6366f1"
          stroke-width="2"
          fill="none"
        />
      </g>
    </svg>

    <!-- Entity Cards -->
    <EntityCard
      v-for="entity in store.entities"
      :key="'c' + entity.id"
      :entity="entity"
      :is-selected="store.selectedEntityId === entity.id"
      :attr-drag="attrDrag"
      :hover-attr="hoverAttr"
      @select="store.selectedEntityId = entity.id"
      @start-drag="handleEntityMouseDown($event, entity)"
      @open-entity-modal="emit('openEntityModal', entity)"
      @open-attr-modal="(attr) => emit('openAttrModal', entity.id, attr)"
      @add-attr="handleAddAttr(entity.id)"
      @delete-attr="(attrId) => store.deleteAttribute(entity.id, attrId)"
      @attr-drag-start="(e, idx, id) => onDragStart(e, entity.id, idx, id)"
      @attr-drag-end="onDragEnd"
      @attr-drag-over="(e, idx) => onDragOver(e, entity.id, idx)"
      @attr-drop="onDrop"
      @hover-attr-change="(v) => hoverAttr = v"
    />
  </div>
</template>
