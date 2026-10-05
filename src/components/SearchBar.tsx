import { useRef } from 'react'
import { useQueryParam } from '../useVisibleMeals'
import styles from './SearchBar.module.css'

// Shared by the list and gallery. Driven by ?q=.
export function SearchBar() {
  const [query, setQuery] = useQueryParam()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className={styles.controls}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search meals..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search meals"
      />
      {query.trim() && (
        <button
          className={styles.clearSearch}
          onClick={() => {
            setQuery('')
            // Keep focus in the field.
            inputRef.current?.focus()
          }}
          aria-label="Clear search"
        >
          Clear
        </button>
      )}
    </div>
  )
}
