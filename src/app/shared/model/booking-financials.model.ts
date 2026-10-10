/** Backend totals for completed and instantly completed bookings. */
export interface BookingFinancialsDto {
  tripsCommissionTotal: number;
  couponDeduction: number;
  bonusDeduction: number;
  tripsCommissionNet: number;
  totalPaidByCustomers: number;
  vendorPendingSettlement: number;
}
