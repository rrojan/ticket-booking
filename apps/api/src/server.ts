import Fastify, { type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { env } from './config/env.js'
import { ticketsRoutes } from './modules/tickets/tickets.routes.js'

interface ServerOptions {
  logger?: boolean
}

export class Server {
  private readonly instance: FastifyInstance

  private constructor(options: ServerOptions = {}) {
    this.instance = Fastify({
      logger: options.logger !== false && {
        level: env.LOG_LEVEL,
        transport: this.getLoggerTransport(),
      },
    })
  }

  static async create(options: ServerOptions = {}): Promise<Server> {
    const server = new Server(options)
    await server.registerPlugins()
    await server.registerRoutes()
    return server
  }

  get fastify(): FastifyInstance {
    return this.instance
  }

  // Start listening for requests
  async listen(host: string, port: number): Promise<void> {
    await this.instance.listen({ host, port })
  }

  // Close server gracefully
  async close(): Promise<void> {
    await this.instance.close()
  }

  private getLoggerTransport() {
    if (env.NODE_ENV !== 'development') {
      return undefined
    }

    return {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    }
  }

  // Register Fastify plugins (csp, CORS)
  private async registerPlugins(): Promise<void> {
    await this.instance.register(helmet, {
      contentSecurityPolicy: false,
    })
    await this.instance.register(cors, {
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  }

  // Register all app's API routes
  private async registerRoutes(): Promise<void> {
    this.instance.get('/health-check', async () => ({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
    }))

    await this.instance.register(ticketsRoutes, { prefix: '/tickets' })
  }
}

// Create a new server instance for app
export async function createServer(): Promise<FastifyInstance> {
  const server = await Server.create()
  return server.fastify
}
