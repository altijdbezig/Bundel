/**
 * Het startpunt van de server.
 *
 * Verder niets: alles wat er gebeurt staat in `http/server.ts` en `http/router.ts`.
 * Ontbreekt er een omgevingsvariabele, dan stopt het hier meteen met een korte
 * regel. Beter nu dan halverwege een koppeling.
 */

import { startServer } from './http/server.ts'

try {
  startServer()
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Bundel: de server kon niet starten')
  process.exit(1)
}
