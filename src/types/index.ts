export interface Attribute {
  id: number
  name: string
  type: string
  length: string
  pk: boolean
  fk: boolean
  nn: boolean
  unique: boolean
  unsigned: boolean
  autoIncrement: boolean
  defaultValue: string
  charset: string
  comment: string
  fkRef: {
    table: string
    column: string
  }
}

export interface Entity {
  id: number
  name: string
  x: number
  y: number
  entityType: string
  color: string
  description: string
  attributes: Attribute[]
}

export interface Relation {
  id: number
  from: number
  to: number
  cardinality: string
  label: string
  fkColumn: string
  fkTargetEntityId: number
}

export interface EntityType {
  id: string
  name: {
    ko: string
    en: string
  }
  color: string
}

export interface PendingRelation {
  fromId: number
  toId: number
  cardinality: string
  label: string
  fkTargetEntityId: number
  fkColumnName: string
  fkColumnType: string
  fkColumnLength: string
  fkColumnUnsigned: boolean
  refTable: string
  refColumn: string
  fkNullable: boolean
}

export interface NewRelation {
  direction: 'from' | 'to'
  targetId: string
  cardinality: string
  label: string
  fkColumnName: string
  refColumn: string
  fkNullable: boolean
}

export interface AttrDragState {
  dragging: boolean
  sourceEntityId: number | null
  draggedAttrId: number | null
  currentIndex: number | null
}

export type Language = 'ko' | 'en'
