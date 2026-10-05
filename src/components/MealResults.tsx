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
        <p>Loading…</p>
      ) : visible.length === 0 ? (
        <p>
          {searching ? (
            <>
              No meals match “{trimmed}”.{' '}
              <button className="linkButton" onClick={() => setLocal('')}>
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