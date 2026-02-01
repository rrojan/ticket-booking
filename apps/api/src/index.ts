import { env } from './config/env.js'
import { closeConnection, verifyConnection } from './db/index.js'
import { createServer } from './server.js'

console.log('eee', env)

const start = async () => {
  try {
    await verifyConnection()
    console.info('Database connected!!!')

    const server = await createServer()
    await server.listen({ host: env.HOST, port: Number(env.PORT) })

    console.info(`Server listening on http://${env.HOST}:${env.PORT}`)
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

const stopApp = async () => {
  console.info('Shutting down...')
  await closeConnection()
  process.exit(0)
}

process.on('SIGTERM', stopApp)
process.on('SIGINT', stopApp)

start()
