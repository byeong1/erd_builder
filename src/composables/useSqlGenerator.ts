import { computed, ref } from 'vue'
import { useErdStore } from '@/stores/erd'

export function useSqlGenerator() {
  const store = useErdStore()
  const includeComments = ref(true)

  const generatedSQL = computed(() => {
    let sql = `-- ERD Builder Pro\n\n`

    store.entities.forEach(entity => {
      sql += `CREATE TABLE ${entity.name} (\n`

      const cols = entity.attributes.map(a => {
        let c = `  ${a.name} ${a.type}`
        if (a.length) c += `(${a.length})`
        if (a.unsigned) c += ' UNSIGNED'
        if (a.charset) c += ` CHARACTER SET ${a.charset}`
        if (a.nn) c += ' NOT NULL'
        else if (!a.pk) c += ' NULL'
        if (a.defaultValue) {
          c += ` DEFAULT ${a.defaultValue.match(/^[0-9]|^NULL|^CURRENT/i) ? a.defaultValue : `'${a.defaultValue}'`}`
        }
        if (a.autoIncrement) c += ' AUTO_INCREMENT'
        if (a.unique && !a.pk) c += ' UNIQUE'
        if (includeComments.value && a.comment) {
          c += ` COMMENT '${a.comment.replace(/'/g, "''")}'`
        }
        return c
      })

      const pks = entity.attributes.filter(a => a.pk)
      if (pks.length) {
        cols.push(`  PRIMARY KEY (${pks.map(p => p.name).join(',')})`)
      }

      entity.attributes
        .filter(a => a.fk && a.fkRef?.table && a.fkRef?.column)
        .forEach(a => {
          cols.push(`  FOREIGN KEY (${a.name}) REFERENCES ${a.fkRef.table}(${a.fkRef.column})`)
        })

      sql += cols.join(',\n') + '\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n'
    })

    return sql
  })

  const copySQL = async () => {
    await navigator.clipboard.writeText(generatedSQL.value)
  }

  const downloadSQL = () => {
    const blob = new Blob([generatedSQL.value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'schema.sql'
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    includeComments,
    generatedSQL,
    copySQL,
    downloadSQL
  }
}
