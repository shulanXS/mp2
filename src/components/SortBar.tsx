import { parseOrder, parseSortKey, SORT_LABELS, SORT_KEYS } from '../types'
import { useUrlParam } from '../useVisibleMeals'
import styles from './SortBar.module.css'

// Sort control shared by the list and gallery.
export function SortBar() {
  const [sortKey, setSortKey] = useUrlParam('sort')
  const [order, setOrder] = useUrlParam('order')
  // Re-validated on read so a hand-edited ?sort= can't break the page.
  const active = parseSortKey(sortKey)
  const direction = parseOrder(order)

  const toggle = () => setOrder(direction === 'asc' ? 'desc' : 'asc')

  return (
    <div className={styles.sortBar}>
      <span className={styles.sortLabel}>Sort</span>
      <div className={styles.sortChips} role="group" aria-label="Sort by">
        {SORT_KEYS.map((k) => (
          <button
            key={k}
            className={`${styles.sortChip} ${active === k ? styles.sortChipOn : ''}`}
            onClick={() => setSortKey(k)}
            aria-pressed={active === k}
          >
            {SORT_LABELS[k]}
          </button>
        ))}
      </div>
      <button
        className={styles.orderToggle}
        onClick={toggle}
        title={
          direction === 'asc'
            ? 'Currently ascending. Activate to sort descending.'
            : 'Currently descending. Activate to sort ascending.'
        }
      >
        <span aria-hidden="true">{direction === 'asc' ? '↑' : '↓'}</span>{' '}
        {direction === 'asc' ? 'Ascending' : 'Descending'}
      </button>
    </div>
  )
}
