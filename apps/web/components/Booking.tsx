import { CreateBookingResponse, TicketTier } from "@repo/shared-types"

interface BookingFormProps {
  tier: TicketTier
}

export const Booking = ({ tier }: BookingFormProps) => {
  return <div className="flex flex-col gap-4">
    <h2 className="text-2xl font-semibold text-text">Book your ticket</h2>
    <div>{tier.tierType}</div>
    <div>{tier.price}</div>
    <div>{tier.availableQuantity}</div>
  </div>
}