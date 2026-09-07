import { Link } from 'react-router-dom'
import { Mark } from '../components/Logo'
import { useI18n } from '../i18n'

export default function NotFound() {
  const { t } = useI18n()

  return (
    <section className="section notfound">
      <div className="page stack stack-4">
        <Mark size={40} />
        <h1 className="title-1">{t.notFound.title}</h1>
        <p className="body measure">{t.notFound.body}</p>
        <div>
          <Link to="/" className="btn btn--primary">
            {t.notFound.cta}
          </Link>
        </div>
      </div>
    </section>
  )
}
