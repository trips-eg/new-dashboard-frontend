export interface ItravelbookingInfo {
  id?: number;
  bookingType?: number;
  reservationDate: Date | string;
  numberOfSeats: number;
  bookingId?: number;
  couponRate?: number;
  from?: string;
  to?: string;
  allowedToSettlement?: boolean;
  allowedToRefund?: boolean;
  isPartial?: boolean;
  depositRate?: number;
  depositValue?: number;
  autoCancelledDate?: any;
  isAutoCancelled?: boolean;
  productPrice?: number;
  salesTaxRate?: number;
  salesTaxValue?: number;
  priceAfterSalesTax?: number;
  tripsRate?: number;
  tripsValue?: number;
  vendorProfitBeforeCoupon?: number;
  couponCode?: string;
  couponValue?: number;
  tripsProfitAfterCoupon?: number;
  vendorProfitAfterCoupon?: number;
  clientPaid?: number;
  vendorRemainingFromTrips?: number;
  salesRate?: number;
  salesRateValue?: number;
  tripsProfitAfterSalesRate?: number;
  isSalesSettled?: boolean;
  vendorSettlementStatus?: number;
  vendorCalculatedAmount?: number;
  vendorSettledAmount?: number;
  couponType?: any;
  isVatIncluded?: boolean;
  tripsCommissionVatRate?: number;
  tripsCommissionVatValue?: number;
  isCommissionSalesSettled?: boolean;
  tripsProfiteAfterCommissionVat?: number;
  bookingRefernce?: string;
  pricePayed?: number;
  status?: number;
  countDetails?: CountDetails;
  trip: Trip;
  user: User;
  companyDto?: any;
  bookDocuments?: any[];
  freeSeats?: number;
  totalSeatsIncludingFree?: number;
}

export interface CountDetails {
  adults: number;
  childAges?: any[];
  childs: number;
  total: number;
}

export interface Trip {
  id: number;
  name: string;
  address?: string;
  rating?: number;
  price?: number;
  childPrice?: number;
  isActive?: boolean;
  fromLocation?: string;
  toLocation?: string;
  numberOfDays?: number;
  startDate?: Date | string;
  endDate?: Date | string;
  capacity?: number;
  remainingSeats?: number;
  isExternallTrip?: boolean;
  isRecommended?: boolean;
  isFake?: boolean;
  externalLink?: any;
  isFav?: boolean;
  isBlocked?: boolean;
  isIncludeVate?: boolean;
  cancellationPolicy?: string;
  isRefundable?: boolean;
  minimumDaysToRefund?: number;
  isAllowPaymentUponArrival?: boolean;
  depositRate?: number;
  images?: any[];
  priceBefore?: any;
  itemPricingPolicyId?: number;
  tripsCommissionValue?: number;
  profitLoss?: number;
  accommodationTypes?: any[];
  childPricingPolicies?: any[];
  itemPricingPolicy?: any;
  features?: any[];
}

export interface User {
  id?: number;
  name: string;
  email: string;
  userName: string;
  phoneNumber: string;
  deviceToken?: string;
  imageUrl?: string;
  iActive?: boolean;
  nationality?: any;
}
