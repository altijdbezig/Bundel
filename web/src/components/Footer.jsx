import { Link } from 'react-router-dom'
import Logo from './Logo'
import { useI18n } from '../i18n'

export default function Footer() {
  const { t } = useI18n()
  const year = new Date().getFullYear()

  const columns = [
    {
      title: t.footer.product,
      items: [
        { label: t.footer.links.features, to: '/#functies' },
        { label: t.footer.links.download, to: '/download' },
        { label: t.footer.links.login, to: '/login' },
      ],
    },
    {
      title: t.footer.company,
      items: [{ label: t.footer.links.about, to: '/over' }],
    },
    {
      title: t.footer.legal,
      items: [{ label: t.footer.links.privacy, to: '/privacy' }],
    },
  ]

  return (
    <footer className="site-footer">
      <div className="page">
        <div className="site-footer__top">
          <div className="stack stack-3 site-footer__brand">
            <Logo size={19} />
            <p className="meta" style={{ maxWidth: '22em' }}>
              {t.footer.tagline}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="stack stack-2">
              <div className="label">{col.title}</div>
              {col.items.map((item) =>
                item.to.includes('#') ? (
                  <a key={item.label} href={item.to} className="site-footer__link">
                    {item.label}
                  </a>
                ) : (
                  <Link key={item.label} to={item.to} className="site-footer__link">
                    {item.label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </div>

        <hr className="hair" />

        <div className="site-footer__bottom">
          <p className="meta" style={{ maxWidth: '52em' }}>
            {t.footer.disclaimer}
          </p>
          <p className="meta">
            © {year} Bundel · AltijdBezig · {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}
