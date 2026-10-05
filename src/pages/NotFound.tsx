import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

export function NotFound() {
  return (
    <section className={styles.wrap}>
      <p className={styles.eyebrow}>Error 404</p>
      <h2 className={styles.title}>
        We can’t find that <em>page.</em>
      </h2>
      <p className={styles.body}>
        The address you followed doesn’t match anything in this directory.
        It may have been moved, renamed, or simply never existed.
      </p>
      <div className={styles.actions}>
        <Link to="/" className={styles.home}>
          ← Back to the index
        </Link>
        <Link to="/gallery" className={styles.alt}>
          Try the gallery →
        </Link>
      </div>
    </section>
  )
}