import z from 'zod'
import type { CreateBookingRequest } from '@repo/shared-types'

/**
 * Booking creation request schema
 *
 * Validates incoming booking requests w/ criteria:
 * - Valid uuids for idempotency keys and ticket tier ids
 * - Quantity within acceptable range (limit to 1-10 tickets per request for now to prevent mistuse)
 * - User ID mocked
 */
export const createBookingSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  ticketTierId: z.uuid('Invalid ticket tier ID format'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Minimum quantity is 1')
    .max(10, 'Maximum quantity is 10 tickets per booking'),
  idempotencyKey: z.uuid('Invalid idempotency key format (must be uuid)'),
}) satisfies z.ZodType<CreateBookingRequest>

export type { CreateBookingRequest }

/**
 * Bookings user request schema
 */
export const getUserBookingsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
})

export type GetUserBookingsRequest = z.infer<typeof getUserBookingsSchema>
