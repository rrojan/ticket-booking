import { env } from './config/env.js'
import { DB } from './db/index.js'
import { Server } from './server.js'

class Application {
  private server: Server | null = null
  private readonly database = DB.getInstance()

  async start(): Promise<void> {
    try {
      await this.database.verify()
      console.info('DB connection successful')

      // Create and start server listening on port in Env
      this.server = await Server.create()
      await this.server.listen(env.HOST, Number(env.PORT))

      console.info(`Environment: ${env.NODE_ENV}`)
      console.info(`\n\nServer listening on http://${env.HOST}:${env.PORT}`)
    } catch (error) {
      console.error('Failed to start application:', error)
      process.exit(1)
    }
  }

  async shutdown(): Promise<void> {
    console.info('Shutting down app...')

    try {
      if (this.server) {
        await this.server.close()
        console.info('Server closed')
      }

      await this.database.close()
      console.info('DB connections closed')

      console.info('Shutdown complete')
      process.exit(0)
    } catch (error) {
      console.error('Error during shutdow!!', error)
      process.exit(1)
    }
  }

  // Register signal handlers for cleaner handling
  registerSignalHandlers(): void {
    const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT']

    for (const signal of signals) {
      process.on(signal, () => this.shutdown())
    }
  }
}

// Bootstrap application
const app = new Application()
app.registerSignalHandlers()

app.start()
