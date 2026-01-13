<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import EntitySidebar from '@/components/EntitySidebar.vue'
import ErdCanvas from '@/components/ErdCanvas.vue'
import EntityModal from '@/components/EntityModal.vue'
import AttributeModal from '@/components/AttributeModal.vue'
import SqlModal from '@/components/SqlModal.vue'
import ColorSettingsModal from '@/components/ColorSettingsModal.vue'
import type { Entity, Attribute } from '@/types'

// Modal states
const showEntityModal = ref(false)
const editingEntity = ref<Entity | null>(null)

const showAttrModal = ref(false)
const attrModalEntityId = ref<number | null>(null)
const editingAttribute = ref<Attribute | null>(null)

const showSqlModal = ref(false)
const showColorSettings = ref(false)

// Entity modal handlers
const openEntityModal = (entity?: Entity) => {
  editingEntity.value = entity || null
  showEntityModal.value = true
}

// Attribute modal handlers
const openAttrModal = (entityId: number, attr: Attribute) => {
  attrModalEntityId.value = entityId
  editingAttribute.value = attr
  showAttrModal.value = true
}

const closeAttrModal = () => {
  showAttrModal.value = false
  attrModalEntityId.value = null
  editingAttribute.value = null
}
</script>

<template>
  <div class="h-screen flex flex-col text-sm">
    <!-- Header -->
    <AppHeader
      @open-color-settings="showColorSettings = true"
      @open-sql-modal="showSqlModal = true"
    />

    <!-- Main Content -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <EntitySidebar @open-entity-modal="openEntityModal" />

      <!-- Canvas -->
      <ErdCanvas
        @open-entity-modal="openEntityModal"
        @open-attr-modal="openAttrModal"
      />
    </div>

    <!-- Modals -->
    <EntityModal
      :show="showEntityModal"
      :entity="editingEntity"
      @close="showEntityModal = false"
      @saved="showEntityModal = false"
    />

    <AttributeModal
      :show="showAttrModal"
      :entity-id="attrModalEntityId"
      :attribute="editingAttribute"
      @close="closeAttrModal"
      @saved="closeAttrModal"
      @deleted="closeAttrModal"
    />

    <SqlModal
      :show="showSqlModal"
      @close="showSqlModal = false"
    />

    <ColorSettingsModal
      :show="showColorSettings"
      @close="showColorSettings = false"
    />
  </div>
</template>
