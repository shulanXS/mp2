import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CategoryFilter } from './CategoryFilter'
import { SearchBar } from './SearchBar'
import { SortBar } from './SortBar'
import { useQueryParam, useVisibleMeals } from '../useVisibleMeals'
import type { MealSummary } from '../types'

type Props = {
  meals: MealSummary[]
  categories: string[]
  loading: boolean
  /** <li> contents differ per view; everything around them does not. */
  renderItems: (visible: MealSummary[]) => ReactNode
  /** Accessible name for the list, e.g. "Meals" or "Meal gallery". */
  label: string
  /** Page's own column width, e.g. 220px for rows, 160px for tiles. */
  className: string
}

// The list and the gallery differ only in how a row is drawn, so the search
// box, category chips, sort control, count and empty state live here.
export function MealResults({ meals, categories, loading, renderItems, label, className }: Props) {
  const [params] = useSearchParams()
  const [query, setQuery] = useQueryParam()
  // Same hook the detail view uses, so "Next" walks exactly this order.
  const visible = useVisibleMeals(meals)
  const searching = query.trim().length > 0
  // Inside a single category every meal shares the same strCategory, so
  // sorting by it would only re-tiebreak on Name -- hide that chip.
  const categoryLocked = !!params.get('cat')

  return (
    <div>
      <SearchBar />

      <CategoryFilter categories={categories} />

      <SortBar disableSortKey={categoryLocked ? 'strCategory' : undefined} />

      {!loading && visible.length > 0 && (
        <p className="count">
          {visible.length} {visible.length === 1 ? 'meal' : 'meals'}
          {searching ? ` matching “${query.trim()}”` : ''}
        </p>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : visible.length === 0 ? (
        <p>
          {searching ? (
            <>
              No meals match “{query.trim()}”.{' '}
              <button className="linkButton" onClick={() => setQuery('')}>
                Show all meals
              </button>
            </>
          ) : (
            'No meals found.'
          )}
        </p>
      ) : (
        <ul className={`${className} resultsGrid`} aria-label={label}>
          {renderItems(visible)}
        </ul>
      )}
    </div>
  )
}
