import dotenv from 'dotenv'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import z from 'zod'

const __dirname = dirname(fileURLToPath(import.meta.url))

dotenv.config({
  path: join(__dirname, '../.env'), // can read from another source for deployments, leaving as is for now
})


export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('localhost'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.string().default('info'),
})

export type Env = z.infer<typeof EnvSchema>

export const env = EnvSchema.parse(process.env)

