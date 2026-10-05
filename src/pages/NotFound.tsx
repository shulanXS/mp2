import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

// Catches any path that matches no route.
export function NotFound() {
  return (
    <div className={styles.wrap}>
      <h2>Page not found</h2>
      <p>That address does not match anything in this app.</p>
      <Link to="/" className={styles.home}>
        ← Back to the list
      </Link>
    </div>
  )
}
