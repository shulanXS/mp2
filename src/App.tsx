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
              <svg viewBox="0 0 36 36" width="36" height="36" focusable="false">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="2 2.5"
                  opacity="0.55"
                />
                <path
                  d="M18 8 V18 L26 22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <circle cx="18" cy="18" r="2.2" fill="currentColor" />
              </svg>
            </span>
            <span className={styles.brandText}>
              <span className={styles.brandTitle}>The Meal DB</span>
              <span className={styles.brandSub}>curated · catalog · cooked</span>
            </span>
          </Link>
        </h1>
        <nav className={styles.nav} aria-label="Main">
          <NavLink to="/" end>
            List
          </NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
        </nav>
      </header>

      {message && (
        <div className={styles.error} role="alert">
          <p>{message}</p>
          <button onClick={tryAgain}>Try again</button>
        </div>
      )}

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

      <footer className="siteFooter">
        <span className="siteFooterBrand">
          <span className="siteFooterDot" aria-hidden="true" />
          The Meal DB
        </span>
        <span>
          Data from{' '}
          <a href="https://www.themealdb.com" target="_blank" rel="noreferrer">
            themealdb.com
          </a>
        </span>
      </footer>
    </div>
  )
}