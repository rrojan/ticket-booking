import { env } from './config/env.js'
import { createServer } from './server.js'

const start = async () => {
  try {
    const server = await createServer()
    await server.listen({ host: env.HOST, port: Number(env.PORT) })

    console.info(`Server listening on http://${env.HOST}:${env.PORT}`)
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

const stopApp = () => {
  console.info('Shutting down...')
  process.exit(0)
}

process.on('SIGTERM', stopApp)
process.on('SIGINT', stopApp)

start()
