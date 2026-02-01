import axios from 'axios'
import type {
  ApiResponse,
  ConcertWithAvailability,
  ConcertWithTiers,
  CreateBookingRequest,
  CreateBookingResponse,
  BookingWithDetails,
} from '@repo/shared-types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getConcerts = async (): Promise<ConcertWithAvailability[]> => {
  const response = await api.get<ApiResponse<ConcertWithAvailability[]>>('/concerts')
  return response.data.data
}

export const getConcert = async (id: string): Promise<ConcertWithTiers> => {
  const response = await api.get<ApiResponse<ConcertWithTiers>>(`/concerts/${id}`)
  return response.data.data
}

export const createBooking = async (data: CreateBookingRequest): Promise<CreateBookingResponse> => {
  const response = await api.post<CreateBookingResponse>('/bookings', data)
  return response.data
}

export const getUserBookings = async (userId: string): Promise<BookingWithDetails[]> => {
  const response = await api.get<ApiResponse<BookingWithDetails[]>>(`/bookings/${userId}`)
  return response.data.data
}

export { api }
