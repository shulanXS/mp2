import { useUrlParam } from '../useVisibleMeals'
import styles from './CategoryFilter.module.css'

type Props = { categories: string[] }

// Category chips backed by ?cat=. Every meal has one category in TheMealDB,
// so these are exclusive choices, not combinable tags.
export function CategoryFilter({ categories }: Props) {
  const [active, choose] = useUrlParam('cat')

  const toggle = (name: string) => choose(name === active ? '' : name)

  if (!categories.length) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.bar} role="group" aria-label="Filter by category">
        <button
          className={`${styles.chip} ${active ? '' : styles.on}`}
          onClick={() => toggle('')}
          aria-pressed={active === ''}
        >
          All
        </button>
        {categories.map((name) => (
          <button
            key={name}
            className={`${styles.chip} ${active === name ? styles.on : ''}`}
            onClick={() => toggle(name)}
            aria-pressed={active === name}
          >
            {name}
          </button>
        ))}
      </div>
      {/* Describes the active filter; `.count` reports the result total. */}
      <p className={styles.status}>
        {active ? `Showing ${active}` : 'Showing all categories'}
      </p>
    </div>
  )
}
