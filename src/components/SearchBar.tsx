import { useRef } from 'react'
import { useDebouncedQueryParam } from '../useVisibleMeals'
import styles from './SearchBar.module.css'

export function SearchBar() {
  const [, local, setLocal] = useDebouncedQueryParam(150)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasText = local.trim().length > 0

  return (
    <div className={styles.controls}>
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon} aria-hidden="true">🔍</span>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="Search meals..."
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          aria-label="Search meals"
        />
      </div>
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
          ✕ Clear
        </button>
      )}
    </div>
  )
}