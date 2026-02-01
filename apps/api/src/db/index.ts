import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../config/env.js'

const client = postgres(env.DATABASE_URL)
export const db = drizzle(client, { casing: 'snake_case' })

/**
 * Verify database connection is working
 */
export const verifyConnection = () => client`SELECT 1`

/**
 * Close connection for cleanup
 */
export const closeConnection = () => client.end()
