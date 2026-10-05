import { Link, NavLink, Route, Routes } from 'react-router-dom'
import { useCategories, useMeals } from './api/useMeals'
import { Gallery } from './pages/Gallery'
import { Detail } from './pages/Detail'
import { List } from './pages/List'
import { NotFound } from './pages/NotFound'
import styles from './App.module.css'

export default function App() {
  const { categories, error: catError, retry: retryCategories } = useCategories()
  const { meals, loading, error, retry } = useMeals(!!catError)

  const tryAgain = catError ? retryCategories : retry
  const message = catError || error

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.brand}>
          <Link to="/" className={styles.brandLink}>
            <span className={styles.brandMark} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="13" r="7" />
                <circle cx="12" cy="13" r="3.6" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" />
                <path d="M9.2 6 L9.2 11.5" />
                <path d="M14.8 6 L14.8 11.5" />
                <path d="M8.4 6 L8.4 8.5" />
                <path d="M10 6 L10 8.5" />
                <path d="M14 6 L14 8.5" />
                <path d="M15.6 6 L15.6 8.5" />
              </svg>
            </span>
            <span className={styles.brandText}>
              <span className={styles.brandTitle}>Table</span>
              <span className={styles.brandSub}>a small meal directory</span>
            </span>
          </Link>
        </h1>
        <nav className={styles.nav} aria-label="Main">
          <NavLink to="/" end>
            Index
          </NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
        </nav>
      </header>

      {message && (
        <div className={styles.error} role="alert">
          <div>
            <p className={styles.errorTitle}>We couldn’t load this section</p>
            <p className={styles.errorBody}>{message}</p>
          </div>
          <button onClick={tryAgain}>Try again</button>
        </div>
      )}

      <main className={styles.main}>
        <Routes>
          <Route
            path="/"
            element={
              <List meals={meals} categories={categories} loading={loading} />
            }
          />
          <Route
            path="/gallery"
            element={
              <Gallery meals={meals} categories={categories} loading={loading} />
            }
          />
          <Route path="/detail/:id" element={<Detail meals={meals} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}