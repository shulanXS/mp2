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
  if (!meal) return <p className={styles.loading}>Loading…</p>
  const ingredients = Array.from({ length: 20 }, (_, i) => i + 1)
    .map((i) => ({
      name: meal[`strIngredient${i}`]?.trim(),
      measure: meal[`strMeasure${i}`]?.trim(),
    }))
    .filter((x) => x.name)
    // Index in the key: a recipe can list the same ingredient twice with
    // different measures.
    .map((x, i) => ({ ...x, key: `${x.name}-${i}`, idx: i + 1 }))

  const tagList = (meal.strTags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  return (
    <article className={styles.detail}>
      <nav className={styles.nav} aria-label="Meal navigation">
        <button
          className={styles.navBtn}
          onClick={() => target(-1)}
          disabled={index < 0}
        >
          ← Previous
        </button>
        <div className={styles.navMid}>
          {index >= 0 && (
            <span className={styles.position}>
              <span className={styles.positionCurrent}>{index + 1}</span>
              <span className={styles.positionSep}>/</span>
              <span className={styles.positionTotal}>
                {String(total).padStart(2, '0')}
              </span>
            </span>
          )}
          <Link
            to={{
              pathname: fromGallery ? '/gallery' : '/',
              search: params.toString(),
            }}
            className={styles.back}
          >
            ← Back to {fromGallery ? 'gallery' : 'list'}
          </Link>
        </div>
        <button
          className={styles.navBtn}
          onClick={() => target(1)}
          disabled={index < 0}
        >
          Next →
        </button>
      </nav>

      <div className={styles.body}>
        <figure className={styles.figure}>
          <img src={meal.strMealThumb} alt={meal.strMeal} />
          <figcaption className={styles.figureCaption}>
            <span>{meal.strMeal}</span>
            <span>01 / 0{ingredients.length || 1}</span>
          </figcaption>
          {meal.strYoutube && (
            <a
              className={styles.youtube}
              href={meal.strYoutube}
              target="_blank"
              rel="noreferrer"
            >
              Watch on YouTube
            </a>
          )}
        </figure>

        <div className={styles.recipe}>
          <header>
            <h1>{meal.strMeal}</h1>
            {tagList.length > 0 && (
              <ul className={styles.tags}>
                {tagList.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </header>

          <dl className={styles.meta}>
            <div>
              <dt>Category</dt>
              <dd>{meal.strCategory || NOT_RECORDED}</dd>
            </div>
            <div>
              <dt>Area</dt>
              <dd>{meal.strArea || NOT_RECORDED}</dd>
            </div>
            <div>
              <dt>Tags</dt>
              <dd>{meal.strTags || '—'}</dd>
            </div>
            <div>
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
            </div>
          </dl>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>Ingredients</span>
              <span className={styles.sectionCount}>
                {String(ingredients.length).padStart(2, '0')} items
              </span>
            </h2>
            {ingredients.length > 0 ? (
              <ul className={styles.ingredients}>
                {ingredients.map((x) => (
                  <li key={x.key}>
                    <span className={styles.checkbox} aria-hidden="true" />
                    <span className={styles.ingName}>{x.name}</span>
                    {x.measure && (
                      <span className={styles.measure}>— {x.measure}</span>
                    )}
                    <span className={styles.ingIndex}>
                      {String(x.idx).padStart(2, '0')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyNote}>No ingredients listed.</p>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span>Instructions</span>
              <span className={styles.sectionHint}>read top to bottom</span>
            </h2>
            <p className={styles.instructions}>
              {formatInstructions(meal.strInstructions)}
            </p>
          </section>
        </div>
      </div>
    </article>
  )
}