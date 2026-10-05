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
          <span className="countNum">{visible.length}</span>
          <span>
            {visible.length === 1 ? 'meal' : 'meals'}
            {searching ? ` matching “${trimmed}”` : ''}
          </span>
        </p>
      )}

      {loading ? (
        <div className="loading">
          <span className="spinner" aria-hidden="true" />
          Loading meals…
        </div>
      ) : visible.length === 0 ? (
        <div className="empty">
          <p className="emptyTitle">
            {searching ? `No meals match “${trimmed}”.` : 'No meals found.'}
          </p>
          {searching ? (
            <p className="emptyHint">
              <button className="linkButton" onClick={() => setLocal('')}>
                Show all meals
              </button>
            </p>
          ) : null}
        </div>
      ) : (
        <ul className={`${className} resultsGrid`} aria-label={label}>
          {renderItems(visible)}
        </ul>
      )}
    </div>
  )
}