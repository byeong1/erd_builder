import { reactive } from 'vue'
import type { AttrDragState } from '@/types'
import { useErdStore } from '@/stores/erd'

export function useAttributeDrag() {
  const store = useErdStore()

  const attrDrag = reactive<AttrDragState>({
    dragging: false,
    sourceEntityId: null,
    draggedAttrId: null,
    currentIndex: null
  })

  const onDragStart = (event: DragEvent, entityId: number, attrIndex: number, attrId: number) => {
    attrDrag.dragging = true
    attrDrag.sourceEntityId = entityId
    attrDrag.draggedAttrId = attrId
    attrDrag.currentIndex = attrIndex

    event.dataTransfer!.effectAllowed = 'move'
    event.dataTransfer!.setData('text/plain', `${entityId}-${attrIndex}`)

    // Create invisible drag image
    const dragImage = document.createElement('div')
    dragImage.style.opacity = '0'
    document.body.appendChild(dragImage)
    event.dataTransfer!.setDragImage(dragImage, 0, 0)
    setTimeout(() => document.body.removeChild(dragImage), 0)
  }

  const onDragEnd = () => {
    attrDrag.dragging = false
    attrDrag.sourceEntityId = null
    attrDrag.draggedAttrId = null
    attrDrag.currentIndex = null
  }

  const onDragOver = (event: DragEvent, entityId: number, attrIndex: number) => {
    if (attrDrag.sourceEntityId !== entityId) return

    event.preventDefault()
    event.dataTransfer!.dropEffect = 'move'

    if (attrDrag.currentIndex === attrIndex) return

    store.reorderAttributes(entityId, attrDrag.currentIndex!, attrIndex)
    attrDrag.currentIndex = attrIndex
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
  }

  return {
    attrDrag,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop
  }
}
