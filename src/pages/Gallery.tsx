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
                <span className={styles.view} aria-hidden="true">↗</span>
              </div>
              <span className={styles.caption}>
                <span className={styles.name}>{m.strMeal}</span>
                <span className={styles.meta}>
                  <span className={styles.metaDot} aria-hidden="true" />
                  {m.strCategory || NOT_RECORDED}
                </span>
              </span>
            </Link>
          </li>
        ))
      }
    />
  )
}