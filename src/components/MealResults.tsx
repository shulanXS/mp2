import type { ReactNode } from 'react'
import { CategoryFilter } from './CategoryFilter'
import { SearchBar } from './SearchBar'
import { SortBar } from './SortBar'
import { useDebouncedQueryParam, useVisibleMeals } from '../useVisibleMeals'
import type { MealSummary } from '../types'

type Props = {
  meals: MealSummary[]
  categories: string[]
  loading: boolean
  renderItems: (visible: MealSummary[]) => ReactNode
  label: string
  className: string
}

// List and gallery share this; only the row markup differs.
export function MealResults({
  meals,
  categories,
  loading,
  renderItems,
  label,
  className,
}: Props) {
  const [urlQuery, , setLocal] = useDebouncedQueryParam()
  const visible = useVisibleMeals(meals)
  const trimmed = urlQuery.trim()
  const searching = trimmed.length > 0

  return (
    <div>
      <SearchBar />

      <CategoryFilter categories={categories} />

      <SortBar />

      {!loading && visible.length > 0 && (
        <p className="count">
          {visible.length} {visible.length === 1 ? 'meal' : 'meals'}
          {searching ? ` matching “${trimmed}”` : ''}
        </p>
      )}

      {loading ? (
        <div className="loading" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <span>Loading delicious meals…</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="empty">
          <span className="emptyIcon" aria-hidden="true">
            {searching ? '🔍' : '🍽'}
          </span>
          <p className="emptyTitle">
            {searching ? `No meals match “${trimmed}”` : 'No meals found'}
          </p>
          {searching ? (
            <p className="emptyHint">
              <button className="linkButton" onClick={() => setLocal('')}>
                Show all meals
              </button>
            </p>
          ) : (
            <p className="emptyHint">Try clearing your filters.</p>
          )}
        </div>
      ) : (
        <ul className={`${className} resultsGrid`} aria-label={label}>
          {renderItems(visible)}
        </ul>
      )}
    </div>
  )
}