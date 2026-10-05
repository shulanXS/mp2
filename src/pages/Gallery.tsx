import { Link, useSearchParams } from 'react-router-dom'
import { MealResults } from '../components/MealResults'
import { NOT_RECORDED } from '../types'
import type { MealSummary } from '../types'
import styles from './Gallery.module.css'

type Props = {
  meals: MealSummary[]
  categories: string[]
  loading: boolean
}

export function Gallery({ meals, categories, loading }: Props) {
  const [params] = useSearchParams()

  return (
    <MealResults
      meals={meals}
      categories={categories}
      loading={loading}
      label="Meal gallery"
      className={styles.list}
      renderItems={(visible) =>
        visible.map((m) => (
          <li key={m.idMeal}>
            <Link
              to={{ pathname: `/detail/${m.idMeal}`, search: params.toString() }}
              state={{ from: '/gallery' }}
              className={styles.card}
            >
              <div className={styles.frame}>
                <img src={m.strMealThumb} alt="" loading="lazy" />
                <span className={styles.view} aria-hidden="true">
                  View
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9 9 3" />
                    <path d="M5 3h4v4" />
                  </svg>
                </span>
                <div className={styles.caption}>
                  <span className={styles.name}>{m.strMeal}</span>
                  <span className={styles.meta}>
                    <span className={styles.metaDot} aria-hidden="true" />
                    {m.strCategory || (
                      <span className={styles.metaMuted}>{NOT_RECORDED}</span>
                    )}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))
      }
    />
  )
}