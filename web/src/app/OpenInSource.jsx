import { IconArrow } from '../components/Icons'
import { useI18n } from '../i18n'
import { sourceColor } from './data'

/**
 * De knop onderaan een venster die je naar de bron brengt.
 *
 * Bundel leest en schrijft niets terug. Inleveren, reageren en een beoordeling
 * openen gebeurt dus in Canvas, Teams of Magister. Zonder deze knop is het
 * overzicht doodlopend: je ziet wel wat er moet, maar je kunt er niets mee.
 *
 * Zolang er geen echte koppeling is wijst de link naar de voorpagina van de
 * bron. Levert een connector straks een adres per item mee, dan kom je op de
 * opdracht zelf uit en verandert hier niets.
 */
export default function OpenInSource({ source, url, note = true }) {
  const { t } = useI18n()

  /* Eigen items komen nergens vandaan, dus daar valt niets te openen. */
  if (!source || source === 'own' || !url) return null

  return (
    <div className="opensource">
      <a className="btn btn--secondary opensource__btn" href={url} target="_blank" rel="noreferrer noopener">
        <span className="dot dot--sm" style={{ background: sourceColor(source) }} />
        {t.app.open[source]}
        <IconArrow size={16} />
      </a>
      {note && <span className="meta opensource__note">{t.app.open.note}</span>}
    </div>
  )
}
