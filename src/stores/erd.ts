import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Entity, Relation, EntityType, Attribute } from '@/types'

export const useErdStore = defineStore('erd', () => {
  let nextId = 100

  const entities = ref<Entity[]>([
    {
      id: 1,
      name: 'User',
      x: 50,
      y: 50,
      entityType: 'parent',
      color: '#6366f1',
      description: '',
      attributes: [
        { id: 1, name: 'id', type: 'INT', length: '', pk: true, fk: false, nn: true, unique: false, unsigned: true, autoIncrement: true, defaultValue: '', charset: '', comment: '', fkRef: { table: '', column: '' } },
        { id: 2, name: 'username', type: 'VARCHAR', length: '50', pk: false, fk: false, nn: true, unique: true, unsigned: false, autoIncrement: false, defaultValue: '', charset: 'utf8mb4', comment: '', fkRef: { table: '', column: '' } },
        { id: 3, name: 'email', type: 'VARCHAR', length: '255', pk: false, fk: false, nn: true, unique: true, unsigned: false, autoIncrement: false, defaultValue: '', charset: '', comment: '', fkRef: { table: '', column: '' } }
      ]
    },
    {
      id: 2,
      name: 'Post',
      x: 380,
      y: 50,
      entityType: 'child',
      color: '#22c55e',
      description: '',
      attributes: [
        { id: 4, name: 'id', type: 'BIGINT', length: '', pk: true, fk: false, nn: true, unique: false, unsigned: true, autoIncrement: true, defaultValue: '', charset: '', comment: '', fkRef: { table: '', column: '' } },
        { id: 5, name: 'user_id', type: 'INT', length: '', pk: false, fk: true, nn: true, unique: false, unsigned: true, autoIncrement: false, defaultValue: '', charset: '', comment: '', fkRef: { table: 'User', column: 'id' } },
        { id: 6, name: 'title', type: 'VARCHAR', length: '200', pk: false, fk: false, nn: true, unique: false, unsigned: false, autoIncrement: false, defaultValue: '', charset: '', comment: '', fkRef: { table: '', column: '' } }
      ]
    }
  ])

  const relations = ref<Relation[]>([
    { id: 1, from: 1, to: 2, cardinality: '1:N', label: '', fkColumn: 'user_id', fkTargetEntityId: 2 }
  ])

  const entityTypes = ref<EntityType[]>([
    { id: 'parent', name: { ko: '부모', en: 'Parent' }, color: '#6366f1' },
    { id: 'child', name: { ko: '자식', en: 'Child' }, color: '#22c55e' },
    { id: 'mapping', name: { ko: '매핑', en: 'Mapping' }, color: '#f97316' },
    { id: 'covering', name: { ko: '커버링', en: 'Covering' }, color: '#eab308' },
    { id: 'history', name: { ko: '히스토리', en: 'History' }, color: '#8b5cf6' },
    { id: 'code', name: { ko: '코드', en: 'Code' }, color: '#14b8a6' },
    { id: 'log', name: { ko: '로그', en: 'Log' }, color: '#64748b' },
    { id: 'custom', name: { ko: '커스텀', en: 'Custom' }, color: '#3b82f6' }
  ])

  const selectedEntityId = ref<number | null>(null)
  const showBadges = ref(true)

  const getNextId = () => nextId++

  const getEntityById = (id: number) => entities.value.find(e => e.id === id)

  const getEntityName = (id: number) => getEntityById(id)?.name || ''

  const addEntity = (entity: Omit<Entity, 'id' | 'attributes'>) => {
    const newEntity: Entity = {
      ...entity,
      id: getNextId(),
      attributes: [{
        id: getNextId(),
        name: 'id',
        type: 'INT',
        length: '',
        pk: true,
        fk: false,
        nn: true,
        unique: false,
        unsigned: true,
        autoIncrement: true,
        defaultValue: '',
        charset: '',
        comment: '',
        fkRef: { table: '', column: '' }
      }]
    }
    entities.value.push(newEntity)
    return newEntity
  }

  const updateEntity = (id: number, data: Partial<Entity>) => {
    const entity = getEntityById(id)
    if (entity) {
      Object.assign(entity, data)
    }
  }

  const deleteEntity = (id: number) => {
    entities.value = entities.value.filter(e => e.id !== id)
    relations.value = relations.value.filter(r => r.from !== id && r.to !== id)
    if (selectedEntityId.value === id) {
      selectedEntityId.value = null
    }
  }

  const addAttribute = (entityId: number): Attribute | null => {
    const entity = getEntityById(entityId)
    if (!entity) return null

    const newAttr: Attribute = {
      id: getNextId(),
      name: 'new_col',
      type: 'VARCHAR',
      length: '255',
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
    }
    entity.attributes.push(newAttr)
    return newAttr
  }

  const updateAttribute = (entityId: number, attrId: number, data: Partial<Attribute>) => {
    const entity = getEntityById(entityId)
    if (!entity) return

    const attrIndex = entity.attributes.findIndex(a => a.id === attrId)
    if (attrIndex > -1) {
      entity.attributes[attrIndex] = { ...entity.attributes[attrIndex], ...data }
    }
  }

  const deleteAttribute = (entityId: number, attrId: number) => {
    const entity = getEntityById(entityId)
    if (entity) {
      entity.attributes = entity.attributes.filter(a => a.id !== attrId)
    }
  }

  const reorderAttributes = (entityId: number, fromIndex: number, toIndex: number) => {
    const entity = getEntityById(entityId)
    if (!entity) return

    const attrs = [...entity.attributes]
    const [movedItem] = attrs.splice(fromIndex, 1)
    attrs.splice(toIndex, 0, movedItem)
    entity.attributes = attrs
  }

  const addRelation = (relation: Omit<Relation, 'id'>) => {
    const newRelation: Relation = {
      ...relation,
      id: getNextId()
    }
    relations.value.push(newRelation)
    return newRelation
  }

  const deleteRelation = (id: number) => {
    const rel = relations.value.find(r => r.id === id)
    if (rel && rel.fkColumn && rel.fkTargetEntityId) {
      const targetEntity = getEntityById(rel.fkTargetEntityId)
      if (targetEntity) {
        targetEntity.attributes = targetEntity.attributes.filter(a => a.name !== rel.fkColumn)
      }
    }
    relations.value = relations.value.filter(r => r.id !== id)
  }

  const getRelationsForEntity = (entityId: number) => {
    return relations.value.filter(r => r.from === entityId || r.to === entityId)
  }

  return {
    entities,
    relations,
    entityTypes,
    selectedEntityId,
    showBadges,
    getNextId,
    getEntityById,
    getEntityName,
    addEntity,
    updateEntity,
    deleteEntity,
    addAttribute,
    updateAttribute,
    deleteAttribute,
    reorderAttributes,
    addRelation,
    deleteRelation,
    getRelationsForEntity
  }
})
