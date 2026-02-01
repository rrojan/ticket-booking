import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'

/**
 * Creates a Fastify server for our ticket booking app
 * We are using fastify here instead of express because it is faster and has better performance, matching our req throughput and usage requirements
 */
export async function createServer(): Promise<FastifyInstance> { const server = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  })
  
  await server.register(helmet, {
    contentSecurityPolicy: false, // Disable CSP for API
  })

  // Register CORS
  await server.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
  

  server.get('/health-check', async () => {
    return {
      data: 'Ticket booking API is rolling!',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      envrionment: process.env.NODE_ENV || 'development',
    }
  })

  return server
}

