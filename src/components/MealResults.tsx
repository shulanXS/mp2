import type { ReactNode } from 'react'
import { CategoryFilter } from './CategoryFilter'
import { SearchBar } from './SearchBar'
import { SortBar } from './SortBar'
import { useDebouncedQueryParam, useVisibleMeals } from '../useVisibleMeals'
import type { MealSummary } from '../types'
import styles from './MealResults.module.css'

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
    <section className={styles.shell}>
      <div className={styles.intro}>
        <h1 className={styles.headline}>
          {searching ? (
            <>
              Meals matching <em>“{trimmed}”</em>
            </>
          ) : (
            <>The index</>
          )}
        </h1>
        <p className={styles.lede}>
          {meals.length} dishes from TheMealDB — search, sort, and filter to
          find something to cook.
        </p>
      </div>

      <div className={styles.toolbar}>
        <SearchBar />
        <SortBar />
      </div>

      <CategoryFilter categories={categories} />

      {!loading && visible.length > 0 && (
        <p className={styles.count}>
          <strong>{visible.length}</strong>
          {visible.length === 1 ? 'meal' : 'meals'}
          {searching ? ` for “${trimmed}”` : ''}
        </p>
      )}

      {loading ? (
        <p className="loading">
          <span className="spinner" aria-hidden="true" /> Loading the index…
        </p>
      ) : visible.length === 0 ? (
        <div className="empty">
          <p className="emptyTitle">
            {searching
              ? `Nothing matched “${trimmed}”`
              : 'No meals to show'}
          </p>
          <p className="emptyHint">
            {searching
              ? 'Try a shorter query, clear a filter, or reset to the full list.'
              : 'Once the data arrives, dishes will appear here.'}
          </p>
          {searching && (
            <p>
              <button className="linkButton" onClick={() => setLocal('')}>
                Show all meals
              </button>
            </p>
          )}
        </div>
      ) : (
        <ul className={`${className} resultsGrid`} aria-label={label}>
          {renderItems(visible)}
        </ul>
      )}
    </section>
  )
}