// ============================================
// OUTING REPORTS
// ============================================

export interface OutingSummaryRequest {
  fromDate: string; // Required - ISO date string
  toDate?: string; // Optional
  companyId?: number; // Optional (VendorId)
  outingId?: number; // Optional
  status?: number; // Optional - booking status enum
}

export interface OutingSummaryItem {
   outingId: number
  outingName: string
  vendorId: number
  vendorName: string
  totalBookings: number
  completedCount: number
  cancelledCount: number
  refundedCount: number
  confirmedCount: number
  pendingCount: number
  usedTicketsCount: number
  unUsedTicketsCount: number
  tripsTotal_Completed: number
  vendorTotal_Completed: number
  clientPaidTotal_Completed: number
  tripsTotal_All: number
  vendorTotal_All: number
  pricePayedTotal: number
}

// ============================================
// TRAVEL REPORTS (Future)
// ============================================

export interface TravelSummaryRequest {
  fromDate: string;
  toDate?: string;
  companyId?: number;
  travelId?: number;
  status?: number;
}

export interface TravelSummaryItem {
  tripId: number
  tripName: string
  vendorId: number
  vendorName: string
  totalBookings: number
  completedCount: number
  cancelledCount: number
  refundedCount: number
  confirmedCount: number
  pendingCount: number
  clientPaid_Completed: number
  tripsProfit_Completed: number
  vendorProfit_Completed: number
  clientPaid_All: number
  tripsProfit_All: number
  vendorProfit_All: number
}

// ============================================
// HOTEL REPORTS (Future)
// ============================================

export interface HotelSummaryRequest {
  fromDate: string;
  toDate?: string;
  companyId?: number;
  hotelId?: number;
  status?: number;
}

export interface HotelSummaryItem {
  roomId: number
  roomName: string
  hotelName: string
  vendorName: string
  totalBookings: number
  completedCount: number
  cancelledCount: number
  refundedCount: number
  confirmedCount: number
  pendingCount: number
  clientPaid_Completed: number
  tripsProfit_Completed: number
  vendorProfit_Completed: number
  clientPaid_All: number
  tripsProfit_All: number
  vendorProfit_All: number
}

// ============================================
// HAJJ/UMMRAH REPORTS (Future)
// ============================================

export interface HajjSummaryRequest {
  fromDate: string;
  toDate?: string;
  companyId?: number;
  hajjId?: number;
  status?: number;
}

export interface HajjSummaryItem {
  hajjId: number;
  hajjName: string;
  vendorId: number;
  vendorName: string;
  totalBookings: number;
  completedCount: number;
  cancelledCount: number;
  refundedCount: number;
  confirmedCount: number;
  pendingCount: number;
  tripsTotal: number;
  vendorTotal: number;
  pricePayedTotal: number;
}

// ============================================
// GENERIC API RESPONSE WRAPPER
// ============================================

export interface ReportApiResponse<T> {
  success: boolean;
  data: T[];
}
