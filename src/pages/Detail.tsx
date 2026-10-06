import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { fetchMeal } from '../api/mealdb'
import { useVisibleMeals } from '../useVisibleMeals'
import { NOT_RECORDED } from '../types'
import type { Meal, MealSummary } from '../types'
import styles from './Detail.module.css'

// API mixes \r\n and bare \r; flatten for white-space: pre-line.
function formatInstructions(raw: string): string {
  const text = raw.replace(/\r\n?/g, '\n').trim()
  if (!text) return 'No instructions provided.'
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n\n')
}

function sourceLabel(url: string): string {
  try {
    const { hostname, pathname } = new URL(url)
    const path = pathname === '/' ? '' : pathname.replace(/\/$/, '')
    const trimmed = path.length > 28 ? `${path.slice(0, 28)}…` : path
    return `${hostname.replace(/^www\./, '')}${trimmed}`
  } catch {
    return url
  }
}

type Props = { meals: MealSummary[] }

// Origin comes from router state since the referrer is unreliable.
export function Detail({ meals }: Props) {
  const { id } = useParams()
  const [params] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [meal, setMeal] = useState<Meal | null>(null)
  const [error, setError] = useState('')

  const fromGallery = (location.state as { from?: string } | null)?.from === '/gallery'

  const siblings = useVisibleMeals(meals)

  useEffect(() => {
    if (!id) return
    let alive = true
    fetchMeal(id)
      .then((m) => {
        if (!alive) return
        setError('')
        setMeal(m)
      })
      .catch(() => {
        if (!alive) return
        setError('Failed to load this meal.')
        setMeal(null)
      })
    return () => {
      alive = false
    }
  }, [id])

  const index = siblings.findIndex((m) => m.idMeal === id)
  const total = siblings.length
  const target = (delta: number) => {
    if (index < 0 || total === 0) return
    const next = (index + delta + total) % total
    navigate({
      pathname: `/detail/${siblings[next].idMeal}`,
      search: params.toString(),
    })
  }

  if (error) return <p className={styles.emptyNote}>{error}</p>
  if (!meal) return (
    <p className="loading">
      <span className="spinner" aria-hidden="true" /> Loading the recipe…
    </p>
  )

  const ingredients = Array.from({ length: 20 }, (_, i) => i + 1)
    .map((i) => ({
      name: meal[`strIngredient${i}`]?.trim(),
      measure: meal[`strMeasure${i}`]?.trim(),
    }))
    .filter((x) => x.name)
    // A recipe can list the same ingredient twice with different measures;
    // the index disambiguates.
    .map((x, i) => ({ ...x, key: `${x.name}-${i}` }))

  return (
    <article className={styles.detail}>
      <nav className={styles.paginator} aria-label="Meal navigation">
        <div className={styles.navGroup}>
          <button
            onClick={() => target(-1)}
            disabled={index < 0}
            className={`${styles.navBtn} ${styles.navBtnPrev}`}
            aria-label="Previous meal"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7.5 2.5 3.5 6l4 3.5" />
            </svg>
            Previous
          </button>
          {index >= 0 && total > 0 && (
            <span className={styles.position}>
              <span className={styles.positionCurrent}>{index + 1}</span>
              <span className={styles.positionSep}>/</span>
              <span className={styles.positionTotal}>{total}</span>
            </span>
          )}
          <button
            onClick={() => target(1)}
            disabled={index < 0}
            className={styles.navBtn}
            aria-label="Next meal"
          >
            Next
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4.5 2.5 8.5 6l-4 3.5" />
            </svg>
          </button>
        </div>
        <Link
          to={{
            pathname: fromGallery ? '/gallery' : '/',
            search: params.toString(),
          }}
          className={styles.back}
        >
          ← Back to {fromGallery ? 'gallery' : 'list'}
        </Link>
      </nav>

      <div className={styles.body}>
        <figure className={styles.figure}>
          <div className={styles.figureFrame}>
            <img src={meal.strMealThumb} alt={meal.strMeal} />
          </div>
          {meal.strYoutube && (
            <a
              href={meal.strYoutube}
              target="_blank"
              rel="noreferrer"
              className={styles.youtube}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                <path d="M3 1.5v11l9-5.5z" />
              </svg>
              Watch on YouTube
            </a>
          )}
        </figure>

        <div className={styles.recipe}>
          <header className={styles.titleBlock}>
            <h1 className={styles.title}>{meal.strMeal}</h1>
            <p className={styles.titleMeta}>
              {meal.strCategory || NOT_RECORDED}
              {meal.strArea && meal.strArea !== meal.strCategory && (
                <> · {meal.strArea}</>
              )}
            </p>
          </header>

          <dl className={styles.meta}>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Tags</dt>
              <dd className={styles.metaValue}>
                {meal.strTags ? meal.strTags : <span className={styles.metaMuted}>—</span>}
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Source</dt>
              <dd className={styles.metaValue}>
                {meal.strSource ? (
                  <a href={meal.strSource} target="_blank" rel="noreferrer">
                    {sourceLabel(meal.strSource)}
                  </a>
                ) : (
                  <span className={styles.metaMuted}>—</span>
                )}
              </dd>
            </div>
          </dl>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>Ingredients</span>
              <span className={styles.sectionCount}>{String(ingredients.length).padStart(2, '0')}</span>
            </h2>
            {ingredients.length > 0 ? (
              <ul className={styles.ingredients}>
                {ingredients.map((x) => (
                  <li key={x.key}>
                    <span className={styles.checkbox} aria-hidden="true" />
                    <span className={styles.ingName}>{x.name}</span>
                    {x.measure && <span className={styles.measure}>{x.measure}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyNote}>No ingredients listed.</p>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>Method</span>
              <span className={styles.sectionCount}>
                {formatInstructions(meal.strInstructions).split('\n\n').length} steps
              </span>
            </h2>
            <p className={styles.instructions}>{formatInstructions(meal.strInstructions)}</p>
          </section>
        </div>
      </div>
    </article>
  )
}