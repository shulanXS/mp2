import { useMultiCategory } from '../useVisibleMeals'
import styles from './CategoryFilter.module.css'

type Props = { categories: string[] }

export function CategoryFilter({ categories }: Props) {
  const { selected, toggle, clear } = useMultiCategory()
  const activeSet = new Set(selected)

  if (!categories.length) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <span className={styles.label}>Categories</span>
        {selected.length > 0 && (
          <button
            type="button"
            className={styles.clear}
            onClick={clear}
            aria-label="Clear category filter"
          >
            Clear ({selected.length})
          </button>
        )}
      </div>
      <div className={styles.bar} role="group" aria-label="Filter by category">
        <button
          type="button"
          className={`${styles.chip} ${selected.length === 0 ? styles.on : ''}`}
          onClick={() => toggle('')}
          aria-pressed={selected.length === 0}
        >
          All
        </button>
        {categories.map((name) => {
          const on = activeSet.has(name)
          return (
            <button
              key={name}
              type="button"
              className={`${styles.chip} ${on ? styles.on : ''}`}
              onClick={() => toggle(name)}
              aria-pressed={on}
            >
              {name}
            </button>
          )
        })}
      </div>
    </div>
  )
}