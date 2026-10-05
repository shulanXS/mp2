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
          <strong>{String(visible.length).padStart(2, '0')}</strong>
          <span>{visible.length === 1 ? 'meal' : 'meals'}</span>
          {searching && (
            <span className="countQuery">matching “{trimmed}”</span>
          )}
        </p>
      )}

      {loading ? (
        <div className="loading">
          <span className="spinner" aria-hidden="true" />
          <span>Loading meals…</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="empty">
          <p className="emptyTitle">
            {searching ? `No meals match “${trimmed}”` : 'No meals to show'}
          </p>
          <p className="emptyHint">
            {searching
              ? 'Try a shorter keyword or clear the search.'
              : 'Adjust your filters above to bring meals back.'}
          </p>
          {searching && (
            <button className="linkButton" onClick={() => setLocal('')}>
              Show all meals
            </button>
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