import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { fetchMeal } from '../api/mealdb'
import { useVisibleMeals } from '../useVisibleMeals'
import { NOT_RECORDED } from '../types'
import type { Meal, MealSummary } from '../types'
import styles from './Detail.module.css'

// The API mixes \r\n and stray \r; normalize once so white-space: pre-line
// renders cleanly.
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

  if (error) return <p className={styles.error}>{error}</p>
  if (!meal)
    return (
      <div className={styles.detailLoading}>
        <span className={styles.detailSpinner} aria-hidden="true" />
        Loading meal…
      </div>
    )
  const ingredients = Array.from({ length: 20 }, (_, i) => i + 1)
    .map((i) => ({
      name: meal[`strIngredient${i}`]?.trim(),
      measure: meal[`strMeasure${i}`]?.trim(),
    }))
    .filter((x) => x.name)
    // Index in the key: a recipe can list the same ingredient twice with
    // different measures.
    .map((x, i) => ({ ...x, key: `${x.name}-${i}` }))

  return (
    <article className={styles.detail}>
      <nav className={styles.nav} aria-label="Meal navigation">
        <button onClick={() => target(-1)} disabled={index < 0} className={styles.navButton}>
          ← Previous
        </button>
        <div className={styles.navMid}>
          {index >= 0 && (
            <span className={styles.position}>
              {index + 1} of {total}
            </span>
          )}
          <Link
            to={{
              pathname: fromGallery ? '/gallery' : '/',
              search: params.toString(),
            }}
            className={styles.back}
          >
            Back to {fromGallery ? 'gallery' : 'list'}
          </Link>
        </div>
        <button onClick={() => target(1)} disabled={index < 0} className={styles.navButton}>
          Next →
        </button>
      </nav>

      <figure className={styles.figure}>
        <div className={styles.body}>
          <img src={meal.strMealThumb} alt={meal.strMeal} />
          <div className={styles.text}>
            <h1>{meal.strMeal}</h1>
            <dl className={styles.meta}>
              <dt>Category</dt>
              <dd>{meal.strCategory || NOT_RECORDED}</dd>
              <dt>Area</dt>
              <dd>{meal.strArea || NOT_RECORDED}</dd>
              <dt>Tags</dt>
              <dd>{meal.strTags || '—'}</dd>
              <dt>Source</dt>
              <dd>
                {meal.strSource ? (
                  <a href={meal.strSource} target="_blank" rel="noreferrer">
                    {sourceLabel(meal.strSource)}
                  </a>
                ) : (
                  '—'
                )}
              </dd>
            </dl>

            <h2>Ingredients</h2>
            {ingredients.length > 0 ? (
              <ol className={styles.ingredients}>
                {ingredients.map((x) => (
                  <li key={x.key}>
                    <span className={styles.ingName}>{x.name}</span>
                    {x.measure ? (
                      <span className={styles.ingMeasure}>{x.measure}</span>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className={styles.emptyNote}>No ingredients listed.</p>
            )}

            <h2>Instructions</h2>
            <p className={styles.instructions}>{formatInstructions(meal.strInstructions)}</p>
          </div>
        </div>
        <figcaption className={styles.caption}>
          Photograph and recipe text sourced from TheMealDB.com.
        </figcaption>
      </figure>
    </article>
  )
}