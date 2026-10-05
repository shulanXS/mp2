import { useRef } from 'react'
import { useDebouncedQueryParam } from '../useVisibleMeals'
import styles from './SearchBar.module.css'

export function SearchBar() {
  const [, local, setLocal] = useDebouncedQueryParam(150)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasText = local.trim().length > 0

  return (
    <div className={styles.wrap}>
      <label className={styles.label} htmlFor="meal-search">
        Search
      </label>
      <div className={styles.field}>
        <svg
          className={styles.icon}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.6-3.6" />
        </svg>
        <input
          id="meal-search"
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="Search meals, areas, tags…"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          aria-label="Search meals"
        />
        {hasText && (
          <button
            type="button"
            className={styles.clearSearch}
            onClick={() => {
              setLocal('')
              inputRef.current?.focus()
            }}
            aria-label="Clear search"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
    </div>
  )
}