import { useRef } from 'react'
import { useDebouncedQueryParam } from '../useVisibleMeals'
import styles from './SearchBar.module.css'

export function SearchBar() {
  const [, local, setLocal] = useDebouncedQueryParam(150)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasText = local.trim().length > 0
  return (
    <div className={styles.controls}>
      <div className={styles.field}>
        <svg
          className={styles.fieldIcon}
          viewBox="0 0 16 16"
          width="14"
          height="14"
          aria-hidden="true"
        >
          <circle
            cx="7"
            cy="7"
            r="4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <line
            x1="10.4"
            y1="10.4"
            x2="14"
            y2="14"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="Search meals by name…"
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
            ×
          </button>
        )}
      </div>
    </div>
  )
}