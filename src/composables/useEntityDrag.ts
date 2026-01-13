import { ref, reactive } from 'vue'
import type { Entity } from '@/types'
import { useErdStore } from '@/stores/erd'

export function useEntityDrag() {
  const store = useErdStore()
  const draggedEntityId = ref<number | null>(null)
  const dragOffset = reactive({ x: 0, y: 0 })

  const onMouseDown = (event: MouseEvent, entity: Entity, canvasRect: DOMRect) => {
    draggedEntityId.value = entity.id
    dragOffset.x = event.clientX - canvasRect.left - entity.x
    dragOffset.y = event.clientY - canvasRect.top - entity.y
  }

  const onMouseMove = (event: MouseEvent, canvasRect: DOMRect) => {
    if (!draggedEntityId.value) return

    const entity = store.getEntityById(draggedEntityId.value)
    if (entity) {
      entity.x = Math.max(0, event.clientX - canvasRect.left - dragOffset.x)
      entity.y = Math.max(0, event.clientY - canvasRect.top - dragOffset.y)
    }
  }

  const onMouseUp = () => {
    draggedEntityId.value = null
  }

  return {
    draggedEntityId,
    onMouseDown,
    onMouseMove,
    onMouseUp
  }
}
