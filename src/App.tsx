import { Link, NavLink, Route, Routes, useSearchParams } from 'react-router-dom'
import { useCategories, useMeals } from './api/useMeals'
import { Gallery } from './pages/Gallery'
import { Detail } from './pages/Detail'
import { List } from './pages/List'
import { NotFound } from './pages/NotFound'
import styles from './App.module.css'

export default function App() {
  const [params] = useSearchParams()
  const cat = params.get('cat') ?? ''
  const { categories, error: catError, retry: retryCategories } = useCategories()
  const { meals, loading, error, retry } = useMeals(cat, !!catError)

  // Retry whichever half failed: the catalogue fetch is gated on categories.
  const tryAgain = catError ? retryCategories : retry
  const message = catError || error

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.brand}>
          <Link to="/">The Meal DB</Link>
        </h1>
        <nav className={styles.nav} aria-label="Main">
          <NavLink to="/">List</NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
        </nav>
      </header>

      {/* role="alert" so a failure is announced rather than appearing silently. */}
      {message && (
        <div className={styles.error} role="alert">
          <p>{message}</p>
          <button onClick={tryAgain}>Try again</button>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={<List meals={meals} categories={categories} loading={loading} />}
        />
        <Route
          path="/gallery"
          element={<Gallery meals={meals} categories={categories} loading={loading} />}
        />
        <Route path="/detail/:id" element={<Detail meals={meals} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
