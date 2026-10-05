import { Link, useSearchParams } from 'react-router-dom'
import { MealResults } from '../components/MealResults'
import { NOT_RECORDED } from '../types'
import type { MealSummary } from '../types'
import styles from './List.module.css'

type Props = {
  meals: MealSummary[]
  categories: string[]
  loading: boolean
}

export function List({ meals, categories, loading }: Props) {
  // Carried into the detail view so Back returns here, and prev/next walk the
  // same query and ordering.
  const [params] = useSearchParams()

  return (
    <MealResults
      meals={meals}
      categories={categories}
      loading={loading}
      label="Meals"
      className={styles.list}
      renderItems={(visible) =>
        visible.map((m) => (
          <li key={m.idMeal}>
            <Link
              to={{ pathname: `/detail/${m.idMeal}`, search: params.toString() }}
              state={{ from: '/' }}
              className={styles.row}
            >
              <img src={m.strMealThumb} alt="" loading="lazy" />
              <div className={styles.rowText}>
                <h2>{m.strMeal}</h2>
                <p>
                  {m.strCategory || NOT_RECORDED}
                  {m.strArea !== m.strCategory ? ` · ${m.strArea || NOT_RECORDED}` : ''}
                </p>
              </div>
            </Link>
          </li>
        ))
      }
    />
  )
}
