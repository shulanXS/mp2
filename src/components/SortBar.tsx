import { parseOrder, parseSortKey, SORT_LABELS, SORT_KEYS } from '../types'
import { useUrlParam } from '../useVisibleMeals'
import styles from './SortBar.module.css'

export function SortBar() {
  const [sortKey, setSortKey] = useUrlParam('sort')
  const [order, setOrder] = useUrlParam('order')
  const active = parseSortKey(sortKey)
  const direction = parseOrder(order)

  const toggle = () => setOrder(direction === 'asc' ? 'desc' : 'asc')

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.label}>Sort</span>
        <button
          type="button"
          className={styles.orderToggle}
          onClick={toggle}
          aria-label={`Sort order: ${direction === 'asc' ? 'ascending' : 'descending'}. Activate to switch.`}
          title={
            direction === 'asc'
              ? 'Currently ascending. Activate to sort descending.'
              : 'Currently descending. Activate to sort ascending.'
          }
        >
          <span className={styles.arrow} aria-hidden="true">
            {direction === 'asc' ? '↑' : '↓'}
          </span>
          {direction === 'asc' ? 'Asc' : 'Desc'}
        </button>
      </div>
      <div className={styles.sortChips} role="group" aria-label="Sort by">
        {SORT_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            className={`${styles.sortChip} ${active === k ? styles.sortChipOn : ''}`}
            onClick={() => setSortKey(k)}
            aria-pressed={active === k}
          >
            {SORT_LABELS[k]}
          </button>
        ))}
      </div>
    </div>
  )
}