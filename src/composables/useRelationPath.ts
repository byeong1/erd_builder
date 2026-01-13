import { useErdStore } from '@/stores/erd'
import type { Relation } from '@/types'

export function useRelationPath() {
  const store = useErdStore()

  const getRelationPath = (rel: Relation): string => {
    const from = store.getEntityById(rel.from)
    const to = store.getEntityById(rel.to)
    if (!from || !to) return ''

    const fx = from.x + 240
    const fy = from.y + 50
    const tx = to.x
    const ty = to.y + 50
    const mx = (fx + tx) / 2

    return `M${fx},${fy} C${mx},${fy} ${mx},${ty} ${tx},${ty}`
  }

  const getCrowsFoot = (rel: Relation, side: 'from' | 'to'): string[] => {
    const from = store.getEntityById(rel.from)
    const to = store.getEntityById(rel.to)
    if (!from || !to) return []

    const [fc, tc] = rel.cardinality.split(':')
    const sz = 10
    const paths: string[] = []

    if (side === 'from') {
      const x = from.x + 240
      const y = from.y + 50
      if (fc === 'N' || fc === 'M') {
        paths.push(
          `M${x},${y} L${x + sz},${y - sz / 2}`,
          `M${x},${y} L${x + sz},${y + sz / 2}`,
          `M${x},${y} L${x + sz},${y}`
        )
      } else {
        paths.push(`M${x + 5},${y - 6} L${x + 5},${y + 6}`)
      }
    } else {
      const x = to.x
      const y = to.y + 50
      if (tc === 'N' || tc === 'M') {
        paths.push(
          `M${x},${y} L${x - sz},${y - sz / 2}`,
          `M${x},${y} L${x - sz},${y + sz / 2}`,
          `M${x},${y} L${x - sz},${y}`
        )
      } else {
        paths.push(`M${x - 5},${y - 6} L${x - 5},${y + 6}`)
      }
    }

    return paths
  }

  return {
    getRelationPath,
    getCrowsFoot
  }
}
