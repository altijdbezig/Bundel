/**
 * De webserver eronder, met `node:http`.
 *
 * Waarom geen Fastify: `server/` heeft geen afhankelijkheden, en dat is de
 * reden dat node de TypeScript zelf draait en de CI niets hoeft te installeren.
 * Voor drie GET-endpoints zonder body-parsing, zonder middleware en zonder
 * validatieschema levert een framework niets op wat we hier missen. Komt er
 * later een echte API bij met veel routes en bodies, dan is Fastify alsnog een
 * prima ruil. Nu zou het alleen een lockfile en een installatiestap toevoegen.
 *
 * Alle logica staat in `router.ts`. Dit bestand vertaalt alleen tussen node en
 * die router, zodat een test de router rechtstreeks kan aanroepen.
 */

import { createServer as createHttpServer } from 'node:http'
import type { IncomingMessage, Server, ServerResponse } from 'node:http'
import { createConnectionStore } from '../store/connections.ts'
import { createOAuthStateStore } from '../store/oauth-state.ts'
import { readConfig } from '../connectors/microsoft/auth.ts'
import { createUserVerifier } from './user.ts'
import { createRouter } from './router.ts'
import type { Router } from './router.ts'

type Env = Record<string, string | undefined>

export const PORT_ENV = 'PORT'
export const APP_BASE_URL_ENV = 'APP_BASE_URL'
export const DEFAULT_PORT = 8787

export interface ServerOptions {
  readonly env?: Env
  readonly router?: Router
}

/** Bouwt de router met alles wat uit de omgeving komt. */
export function routerFromEnv(env: Env = process.env): Router {
  return createRouter({
    microsoft: readConfig(env),
    stateStore: createOAuthStateStore({ env }),
    connections: createConnectionStore({ env }),
    verifyUser: createUserVerifier({ env }),
    appBaseUrl: env[APP_BASE_URL_ENV],
  })
}

export function createServer(options: ServerOptions = {}): Server {
  const env = options.env ?? process.env
  const router = options.router ?? routerFromEnv(env)

  return createHttpServer(async (request: IncomingMessage, response: ServerResponse) => {
    const result = await router(request.method ?? 'GET', request.url ?? '/', request.headers)
    response.writeHead(result.status, result.headers)
    response.end(result.body)
  })
}

export function readPort(env: Env = process.env): number {
  const raw = env[PORT_ENV]
  const port = raw ? Number(raw) : DEFAULT_PORT
  return Number.isInteger(port) && port > 0 ? port : DEFAULT_PORT
}

/** Start de server. Logt alleen de poort, verder niets. */
export function startServer(env: Env = process.env): Server {
  const server = createServer({ env })
  const port = readPort(env)
  server.listen(port, () => {
    console.log(`Bundel server luistert op http://localhost:${port}`)
  })
  return server
}
