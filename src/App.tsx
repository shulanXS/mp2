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
        <div className={styles.masthead}>
          <p className={styles.kicker}>A Catalog of Recipes · No. 1</p>
          <h1 className={styles.brand}>
            <Link to="/">The Meal DB</Link>
          </h1>
          <p className={styles.dateline}>Browse, sort, and inspect meals from the open data set.</p>
        </div>
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
    </div>
  )
}