import { useEffect } from 'react'
import { parseOrder, parseSortKey, SORT_LABELS, SORT_KEYS, type SortKey } from '../types'
import { useUrlParam } from '../useVisibleMeals'
import styles from './SortBar.module.css'

type Props = {
  /** A sort key that would be a no-op in the current view (e.g. strCategory
   *  inside a single-category filter, where every meal shares the same value).
   *  Its chip is disabled and the URL is rewritten to a meaningful key so
   *  "back" cannot land on a chip that no longer exists. */
  disableSortKey?: SortKey
}

// Sort control shared by the list and gallery.
export function SortBar({ disableSortKey }: Props = {}) {
  const [sortKey, setSortKey] = useUrlParam('sort')
  const [order, setOrder] = useUrlParam('order')
  // Re-validated on read so a hand-edited ?sort= can't break the page.
  const active = parseSortKey(sortKey)
  const direction = parseOrder(order)

  useEffect(() => {
    if (disableSortKey && active === disableSortKey) setSortKey('strMeal')
  }, [disableSortKey, active, setSortKey])

  const toggle = () => setOrder(direction === 'asc' ? 'desc' : 'asc')

  return (
    <div className={styles.sortBar}>
      <span className={styles.sortLabel}>Sort</span>
      <div className={styles.sortChips} role="group" aria-label="Sort by">
        {SORT_KEYS.map((k) => {
          const disabled = k === disableSortKey
          return (
            <button
              key={k}
              className={`${styles.sortChip} ${active === k ? styles.sortChipOn : ''}`}
              onClick={() => !disabled && setSortKey(k)}
              disabled={disabled}
              aria-pressed={active === k}
              title={disabled ? 'Every meal here has the same value for this field.' : undefined}
            >
              {SORT_LABELS[k]}
            </button>
          )
        })}
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