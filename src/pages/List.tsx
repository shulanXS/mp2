import { Link, useSearchParams } from 'react-router-dom'
import { MealResults } from '../components/MealResults'
import type { MealSummary } from '../types'
import styles from './List.module.css'

type Props = {
  meals: MealSummary[]
  categories: string[]
  loading: boolean
}

export function List({ meals, categories, loading }: Props) {
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
                <h2 className={styles.rowTitle}>{m.strMeal}</h2>
                {m.strCategory && (
                  <p className={styles.rowMeta}>{m.strCategory}</p>
                )}
              </div>
              <span className={styles.rowArrow} aria-hidden="true">→</span>
            </Link>
          </li>
        ))
      }
    />
  )
}