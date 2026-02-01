import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres, { type Sql } from 'postgres'
import { env } from '../config/env.js'

export class DB {
  private static instance: DB
  private readonly client: Sql
  readonly connection: PostgresJsDatabase

  private constructor(connectionUrl: string) {
    this.client = postgres(connectionUrl, {
      // Connection pool settings for performance matching our non-functional requiremnts
      max: 20,
      idle_timeout: 30,
      connect_timeout: 10,
    })

    this.connection = drizzle(this.client, { casing: 'snake_case' })
  }

  static getInstance(): DB {
    if (!DB.instance) {
      DB.instance = new DB(env.DATABASE_URL)
    }
    return DB.instance
  }

  // Verify db conn is successful
  async verify(): Promise<void> {
    await this.client`SELECT 1`
  }

  // Clean db connection gracefully
  async close(): Promise<void> {
    await this.client.end()
  }
}

const database = DB.getInstance()

export const db = database.connection

export const verifyConnection = () => database.verify()
export const closeConnection = () => database.close()
