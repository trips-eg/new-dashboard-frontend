

// export interface Ibookings {
//   id: number
//   createdDate: string
//   userId: number
//   deviceId: string
//   bookingRefernce: string
//   sataus: number
//   cashierUrl: string
//   totalPrice: number
//   totalTax: number
//   total: number
//   isPartial: boolean
//   opayRate: number
//   opayRateAmount: number
//   opayValue: number
//   tripsOperationExpenseValue: number
//   tripsOperationExpenseRate: number
//   tripsOperationExpenseRateAmount: number
//   autoCancelledDate: string
//   isAutoCancelled: boolean
//   allowedToRefund: boolean
//   user: User
//   roomBookings: any[]
//   tripReservations: TripReservation[]
//   outingReservations: OutingReservation[]
//   hajjReservations: any[]
//   bankTransactoins: any[]
//   walletTransactions: WalletTransaction[]
// }

// export interface User {
//   deviceToken: string
//   imageUrl: string
//   iActive: boolean
//   id: number
//   name: string
//   email: string
//   userName: string
//   phoneNumber: string
//   nationality: any
// }

// export interface TripReservation {
//   id: number
//   reservationDate: string
//   numberOfSeats: number
//   bookingId: number
//   couponRate: number
//   from: string
//   to: string
//   allowedToSettlement: boolean
//   allowedToRefund: boolean
//   isPartial: boolean
//   depositRate: number
//   depositValue: number
//   autoCancelledDate: string
//   isAutoCancelled: boolean
//   productPrice: number
//   salesTaxRate: number
//   salesTaxValue: number
//   priceAfterSalesTax: number
//   tripsRate: number
//   tripsValue: number
//   vendorProfitBeforeCoupon: number
//   couponCode: string
//   couponValue: number
//   tripsProfitAfterCoupon: number
//   vendorProfitAfterCoupon: number
//   clientPaid: number
//   vendorRemainingFromTrips: number
//   salesRate: number
//   salesRateValue: number
//   tripsProfitAfterSalesRate: number
//   isSalesSettled: boolean
//   isVendorSettled: boolean
//   couponType: any
//   isVatIncluded: boolean
//   tripsCommissionVatRate: number
//   tripsCommissionVatValue: number
//   isCommissionSalesSettled: boolean
//   tripsProfiteAfterCommissionVat: number
//   bookingRefernce: string
//   pricePayed: number
//   status: number
//   countDetails: CountDetails
//   trip: Trip
//   user: User2
//   companyDto: CompanyDto
//   bookDocuments: any[]
// }

// export interface CountDetails {
//   adults: number
//   childAges: any
//   childs: number
//   total: number
// }

// export interface Trip {
//   id: number
//   name: string
//   address: string
//   rating: number
//   price: number
//   childPrice: number
//   isActive: boolean
//   fromLocation: string
//   toLocation: string
//   numberOfDays: number
//   startDate: string
//   endDate: string
//   capacity: number
//   remainingSeats: number
//   isExternallTrip: boolean
//   isRecommended: boolean
//   isFake: boolean
//   externalLink: string
//   isFav: boolean
//   isBlocked: boolean
//   isIncludeVate: boolean
//   cancellationPolicy: string
//   isRefundable: boolean
//   minimumDaysToRefund: number
//   isAllowPaymentUponArrival: boolean
//   depositRate: number
//   images: any[]
// }

// export interface User2 {
//   deviceToken: string
//   imageUrl: string
//   iActive: boolean
//   id: number
//   name: string
//   email: string
//   userName: string
//   phoneNumber: string
//   nationality: any
// }

// export interface CompanyDto {
//   id: number
//   name: string
//   description: string
//   logoUrl: string
//   email: string
//   address: string
//   phone: string
//   isBlocked: boolean
// }

// export interface OutingReservation {
//   quantity: number
//   ticketPrice: number
//   totalPrice: number
//   outingId: number
//   outingTicketId: number
//   customerBookingId: number
//   id: number
//   reservationDate: string
//   numberOfSeats: number
//   bookingId: number
//   couponRate: number
//   from: string
//   to: string
//   allowedToSettlement: boolean
//   allowedToRefund: boolean
//   isPartial: boolean
//   depositRate: number
//   depositValue: number
//   productPrice: number
//   salesTaxRate: number
//   salesTaxValue: number
//   priceAfterSalesTax: number
//   tripsRate: number
//   tripsValue: number
//   vendorProfitBeforeCoupon: number
//   couponCode: string
//   couponValue: number
//   tripsProfitAfterCoupon: number
//   vendorProfitAfterCoupon: number
//   clientPaid: number
//   vendorRemainingFromTrips: number
//   salesRate: number
//   salesRateValue: number
//   tripsProfitAfterSalesRate: number
//   isSalesSettled: boolean
//   isVendorSettled: boolean
//   couponType: any
//   isVatIncluded: boolean
//   tripsCommissionVatRate: number
//   tripsCommissionVatValue: number
//   isCommissionSalesSettled: boolean
//   tripsProfiteAfterCommissionVat: number
//   bookingRefernce: string
//   pricePayed: number
//   status: number
//   countDetails: CountDetails2
//   outing: Outing
//   user: User3
//   companyDto: CompanyDto2
//   autoCancelledDate: string
//   isAutoCancelled: boolean
//   tecket: Tecket
//   outingTicketSerialNumbers: OutingTicketSerialNumber[]
// }

// export interface CountDetails2 {
//   adults: number
//   childAges: any
//   childs: number
//   total: number
// }

// export interface Outing {
//   id: number
//   name: string
//   description: string
//   location: string
//   startDate: string
//   endDate: string
//   rating: number
//   targetAudience: string
//   imageUrl: string
//   isActive: boolean
//   isBlocked: boolean
//   outingCategoryId: number
//   outingCategoryName: any
//   vendorId: number
//   vendorName: string
//   outingCategory: any
//   vendor: Vendor
//   tickets: Ticket[]
//   addOns: any[]
//   features: any[]
//   offers: any[]
//   reviews: any[]
//   images: Image[]
//   maxPrice: number
//   miniPrice: number
//   isFav: boolean
//   depositRate: any
//   cancellationPolicy: any
//   isRefundable: boolean
//   minimumDaysToRefund: any
//   savingsRatio: any
// }

// export interface Vendor {
//   id: number
//   name: string
//   description: string
//   logoUrl: string
//   email: string
//   address: string
//   phone: string
//   isBlocked: boolean
// }

// export interface Ticket {
//   id: number
//   ticketType: string
//   description: string
//   price: number
//   childPrice: any
//   availableQuantity: number
//   isActive: boolean
//   outingId: number
//   hasSerialNumber: boolean
//   outingTicketSerialNumbers: any[]
// }

// export interface Image {
//   id: number
//   url: string
//   altText: string
//   isPrimary: boolean
//   outingId: number
// }

// export interface User3 {
//   deviceToken: string
//   imageUrl: string
//   iActive: boolean
//   id: number
//   name: string
//   email: string
//   userName: string
//   phoneNumber: string
//   nationality: any
// }

// export interface CompanyDto2 {
//   id: number
//   name: string
//   description: string
//   logoUrl: string
//   email: string
//   address: string
//   phone: string
//   isBlocked: boolean
// }

// export interface Tecket {
//   id: number
//   ticketType: string
//   description: string
//   price: number
//   childPrice: any
//   availableQuantity: number
//   isActive: boolean
//   outingId: number
//   hasSerialNumber: boolean
//   outingTicketSerialNumbers: any[]
// }

// export interface OutingTicketSerialNumber {
//   serialNumber: string
//   isUsed: boolean
// }

// export interface WalletTransaction {
//   id: number
//   amountIn: number
//   amountOut: number
//   balanceAfterTransaction: number
//   transactionType: number
//   transactionTypeName: string
//   transactionDate: string
//   bookingRefernce: string
//   chargeRefernce: any
// }

































































// export interface Ibookings {
//   id: number
//   createdDate: string
//   userId: number
//   deviceId: string
//   bookingRefernce: string
//   sataus: number
//   cashierUrl: string
//   totalPrice: number
//   totalTax: number
//   total: number
//   isPartial: boolean
//   opayRate: number
//   opayRateAmount: number
//   opayValue: number
//   tripsOperationExpenseValue: number
//   tripsOperationExpenseRate: number
//   tripsOperationExpenseRateAmount: number
//   autoCancelledDate: string
//   isAutoCancelled: boolean
//   allowedToRefund: boolean
//   user: User
//   // تم دمج الأنواع هنا
//   roomBookings: RoomBooking[]
//   tripReservations: TripReservation[]
//   outingReservations: OutingReservation[]
//   hajjReservations: any[]
//   bankTransactoins: any[]
//   walletTransactions: WalletTransaction[]
// }

// // --- Common Interfaces ---

// export interface User {
//   deviceToken: string
//   imageUrl: string
//   iActive: boolean
//   id: number
//   name: string
//   email: string
//   userName: string
//   phoneNumber: string
//   nationality: any
// }

// export interface CompanyDto {
//   id: number
//   name: string
//   description: string
//   logoUrl: string
//   email: string
//   address: string
//   phone: string
//   isBlocked: boolean
// }

// export interface WalletTransaction {
//   id: number
//   amountIn: number
//   amountOut: number
//   balanceAfterTransaction: number
//   transactionType: number
//   transactionTypeName: string
//   transactionDate: string
//   bookingRefernce: string
//   chargeRefernce: any
// }

// export interface CountDetails {
//   adults: number
//   childAges: any
//   childs: number
//   total: number
// }

// // --- Room Booking Interfaces ---

// export interface RoomBooking {
//   id: number
//   userId: number
//   user: string
//   userdto: User // Can utilize the main User interface if structures match perfectly, otherwise kept separate if logic differs
//   roomId: number
//   room: string
//   roomDto: RoomDto
//   hotelId: number
//   hotel: string
//   price: number
//   startDate: string
//   endDate: string
//   adults: number
//   childs: number
//   childAges: string
//   status: number
//   bookingRefernce: string
//   bookingId: number
//   companyDto: CompanyDto
//   createDate: string
//   couponRate: number
//   isPartial: boolean
//   depositRate: number
//   depositValue: number
//   allowedToSettlement: boolean
//   allowedToRefund: boolean
//   autoCancelledDate: string
//   isAutoCancelled: boolean
//   productPrice: number
//   salesTaxRate: number
//   salesTaxValue: number
//   priceAfterSalesTax: number
//   tripsRate: number
//   tripsValue: number
//   vendorProfitBeforeCoupon: number
//   couponCode: string
//   couponValue: number
//   tripsProfitAfterCoupon: number
//   vendorProfitAfterCoupon: number
//   clientPaid: number
//   vendorRemainingFromTrips: number
//   salesRate: number
//   salesRateValue: number
//   tripsProfitAfterSalesRate: number
//   isSalesSettled: boolean
//   isVendorSettled: boolean
//   couponType: any
//   isVatIncluded: boolean
//   tripsCommissionVatRate: number
//   tripsCommissionVatValue: number
//   isCommissionSalesSettled: boolean
//   tripsProfiteAfterCommissionVat: number
// }

// export interface RoomDto {
//   id: number
//   name: string
//   description: string
//   size: number
//   bedCount: number
//   price: number
//   childPrice: number
//   cancellationPolicy: string
//   isRefundable: boolean
//   minimumDaysToRefund: number
//   isAllowPaymentUponArrival: boolean
//   depositRate: number
//   boarding: string
//   boardingType: any
//   bordingObj: BordingObj
//   availableFrom: string
//   availableTo: string
//   hotelId: number
//   hotel: string
//   roomTypeId: number
//   roomType: any
//   isIncludeVate: boolean
//   bedTypeId: number
//   bedType: any
//   holidayPrice: number
//   calculatedPrice: any
//   features: any[]
//   featuresNames: any
//   images: any[]
//   groupImages: any[]
//   customPrice: any[]
//   isInCart: boolean
//   isFake: boolean
//   isBlocked: boolean
//   companyDto: CompanyDto
// }

// export interface BordingObj {
//   value: number
//   nameEn: any
//   nameAr: any
// }

// // --- Trip Reservation Interfaces ---

// export interface TripReservation {
//   id: number
//   reservationDate: string
//   numberOfSeats: number
//   bookingId: number
//   couponRate: number
//   from: string
//   to: string
//   allowedToSettlement: boolean
//   allowedToRefund: boolean
//   isPartial: boolean
//   depositRate: number
//   depositValue: number
//   autoCancelledDate: string
//   isAutoCancelled: boolean
//   productPrice: number
//   salesTaxRate: number
//   salesTaxValue: number
//   priceAfterSalesTax: number
//   tripsRate: number
//   tripsValue: number
//   vendorProfitBeforeCoupon: number
//   couponCode: string
//   couponValue: number
//   tripsProfitAfterCoupon: number
//   vendorProfitAfterCoupon: number
//   clientPaid: number
//   vendorRemainingFromTrips: number
//   salesRate: number
//   salesRateValue: number
//   tripsProfitAfterSalesRate: number
//   isSalesSettled: boolean
//   isVendorSettled: boolean
//   couponType: any
//   isVatIncluded: boolean
//   tripsCommissionVatRate: number
//   tripsCommissionVatValue: number
//   isCommissionSalesSettled: boolean
//   tripsProfiteAfterCommissionVat: number
//   bookingRefernce: string
//   pricePayed: number
//   status: number
//   countDetails: CountDetails
//   trip: Trip
//   user: User
//   companyDto: CompanyDto
//   bookDocuments: any[]
// }

// export interface Trip {
//   id: number
//   name: string
//   address: string
//   rating: number
//   price: number
//   childPrice: number
//   isActive: boolean
//   fromLocation: string
//   toLocation: string
//   numberOfDays: number
//   startDate: string
//   endDate: string
//   capacity: number
//   remainingSeats: number
//   isExternallTrip: boolean
//   isRecommended: boolean
//   isFake: boolean
//   externalLink: string
//   isFav: boolean
//   isBlocked: boolean
//   isIncludeVate: boolean
//   cancellationPolicy: string
//   isRefundable: boolean
//   minimumDaysToRefund: number
//   isAllowPaymentUponArrival: boolean
//   depositRate: number
//   images: any[]
// }

// // --- Outing Reservation Interfaces ---

// export interface OutingReservation {
//   quantity: number
//   ticketPrice: number
//   totalPrice: number
//   outingId: number
//   outingTicketId: number
//   customerBookingId: number
//   id: number
//   reservationDate: string
//   numberOfSeats: number
//   bookingId: number
//   couponRate: number
//   from: string
//   to: string
//   allowedToSettlement: boolean
//   allowedToRefund: boolean
//   isPartial: boolean
//   depositRate: number
//   depositValue: number
//   productPrice: number
//   salesTaxRate: number
//   salesTaxValue: number
//   priceAfterSalesTax: number
//   tripsRate: number
//   tripsValue: number
//   vendorProfitBeforeCoupon: number
//   couponCode: string
//   couponValue: number
//   tripsProfitAfterCoupon: number
//   vendorProfitAfterCoupon: number
//   clientPaid: number
//   vendorRemainingFromTrips: number
//   salesRate: number
//   salesRateValue: number
//   tripsProfitAfterSalesRate: number
//   isSalesSettled: boolean
//   isVendorSettled: boolean
//   couponType: any
//   isVatIncluded: boolean
//   tripsCommissionVatRate: number
//   tripsCommissionVatValue: number
//   isCommissionSalesSettled: boolean
//   tripsProfiteAfterCommissionVat: number
//   bookingRefernce: string
//   pricePayed: number
//   status: number
//   countDetails: CountDetails
//   outing: Outing
//   user: User
//   companyDto: CompanyDto
//   autoCancelledDate: string
//   isAutoCancelled: boolean
//   tecket: Ticket
//   outingTicketSerialNumbers: OutingTicketSerialNumber[]
// }

// export interface Outing {
//   id: number
//   name: string
//   description: string
//   location: string
//   startDate: string
//   endDate: string
//   rating: number
//   targetAudience: string
//   imageUrl: string
//   isActive: boolean
//   isBlocked: boolean
//   outingCategoryId: number
//   outingCategoryName: any
//   vendorId: number
//   vendorName: string
//   outingCategory: any
//   vendor: Vendor
//   tickets: Ticket[]
//   addOns: any[]
//   features: any[]
//   offers: any[]
//   reviews: any[]
//   images: Image[]
//   maxPrice: number
//   miniPrice: number
//   isFav: boolean
//   depositRate: any
//   cancellationPolicy: any
//   isRefundable: boolean
//   minimumDaysToRefund: any
//   savingsRatio: any
// }

// export interface Vendor {
//   id: number
//   name: string
//   description: string
//   logoUrl: string
//   email: string
//   address: string
//   phone: string
//   isBlocked: boolean
// }

// export interface Ticket {
//   id: number
//   ticketType: string
//   description: string
//   price: number
//   childPrice: any
//   availableQuantity: number
//   isActive: boolean
//   outingId: number
//   hasSerialNumber: boolean
//   outingTicketSerialNumbers: any[]
// }

// export interface Image {
//   id: number
//   url: string
//   altText: string
//   isPrimary: boolean
//   outingId: number
// }

// export interface OutingTicketSerialNumber {
//   serialNumber: string
//   isUsed: boolean
// }
//hajjReservation








export interface Ibookings {
  id: number
  createdDate: string
  userId: number
  deviceId: string
  bookingRefernce: string
  sataus: number
  cashierUrl: string
  totalPrice: number
  totalTax: number
  total: number
  isPartial: boolean
  opayRate: number
  opayRateAmount: number
  opayValue: number
  tripsOperationExpenseValue: number
  tripsOperationExpenseRate: number
  tripsOperationExpenseRateAmount: number
  autoCancelledDate: string
  isAutoCancelled: boolean
  allowedToRefund: boolean
  user: User
  // --- All Reservation Types ---
  roomBookings: RoomBooking[]
  tripReservations: TripReservation[]
  outingReservations: OutingReservation[]
  hajjReservations: HajjReservation[] // تمت إضافة الحج هنا
  bankTransactoins: any[]
  walletTransactions: WalletTransaction[]
}

// --- Common / Shared Interfaces ---

export interface User {
  deviceToken: string
  imageUrl: string
  iActive: boolean
  id: number
  name: string
  email: string
  userName: string
  phoneNumber: string
  nationality: any
}

export interface CompanyDto {
  id: number
  name: string
  description: string
  logoUrl: string
  email: string
  address: string
  phone: string
  isBlocked: boolean
}

export interface WalletTransaction {
  id: number
  amountIn: number
  amountOut: number
  balanceAfterTransaction: number
  transactionType: number
  transactionTypeName: string
  transactionDate: string
  bookingRefernce: string
  chargeRefernce: any
}

export interface CountDetails {
  adults: number
  childAges: any
  childs: number
  total: number
}

// --- Room Booking Interfaces ---

export interface RoomBooking {
  id: number
  userId: number
  user: string
  userdto: User
  roomId: number
  room: string
  roomDto: RoomDto
  hotelId: number
  hotel: string
  price: number
  startDate: string
  endDate: string
  adults: number
  childs: number
  childAges: string
  status: number
  bookingRefernce: string
  bookingId: number
  companyDto: CompanyDto
  createDate: string
  couponRate: number
  isPartial: boolean
  depositRate: number
  depositValue: number
  allowedToSettlement: boolean
  allowedToRefund: boolean
  autoCancelledDate: string
  isAutoCancelled: boolean
  productPrice: number
  salesTaxRate: number
  salesTaxValue: number
  priceAfterSalesTax: number
  tripsRate: number
  tripsValue: number
  vendorProfitBeforeCoupon: number
  couponCode: string
  couponValue: number
  tripsProfitAfterCoupon: number
  vendorProfitAfterCoupon: number
  clientPaid: number
  vendorRemainingFromTrips: number
  salesRate: number
  salesRateValue: number
  tripsProfitAfterSalesRate: number
  isSalesSettled: boolean
  isVendorSettled: boolean
  couponType: any
  isVatIncluded: boolean
  tripsCommissionVatRate: number
  tripsCommissionVatValue: number
  isCommissionSalesSettled: boolean
  tripsProfiteAfterCommissionVat: number
}

export interface RoomDto {
  id: number
  name: string
  description: string
  size: number
  bedCount: number
  price: number
  childPrice: number
  cancellationPolicy: string
  isRefundable: boolean
  minimumDaysToRefund: number
  isAllowPaymentUponArrival: boolean
  depositRate: number
  boarding: string
  boardingType: any
  bordingObj: BordingObj
  availableFrom: string
  availableTo: string
  hotelId: number
  hotel: string
  roomTypeId: number
  roomType: any
  isIncludeVate: boolean
  bedTypeId: number
  bedType: any
  holidayPrice: number
  calculatedPrice: any
  features: any[]
  featuresNames: any
  images: any[]
  groupImages: any[]
  customPrice: any[]
  isInCart: boolean
  isFake: boolean
  isBlocked: boolean
  companyDto: CompanyDto
}

export interface BordingObj {
  value: number
  nameEn: any
  nameAr: any
}

// --- Trip Reservation Interfaces ---

export interface TripReservation {
  id: number
  reservationDate: string
  numberOfSeats: number
  bookingId: number
  couponRate: number
  from: string
  to: string
  allowedToSettlement: boolean
  allowedToRefund: boolean
  isPartial: boolean
  depositRate: number
  depositValue: number
  autoCancelledDate: string
  isAutoCancelled: boolean
  productPrice: number
  salesTaxRate: number
  salesTaxValue: number
  priceAfterSalesTax: number
  tripsRate: number
  tripsValue: number
  vendorProfitBeforeCoupon: number
  couponCode: string
  couponValue: number
  tripsProfitAfterCoupon: number
  vendorProfitAfterCoupon: number
  clientPaid: number
  vendorRemainingFromTrips: number
  salesRate: number
  salesRateValue: number
  tripsProfitAfterSalesRate: number
  isSalesSettled: boolean
  isVendorSettled: boolean
  couponType: any
  isVatIncluded: boolean
  tripsCommissionVatRate: number
  tripsCommissionVatValue: number
  isCommissionSalesSettled: boolean
  tripsProfiteAfterCommissionVat: number
  bookingRefernce: string
  pricePayed: number
  status: number
  countDetails: CountDetails
  trip: Trip
  user: User
  companyDto: CompanyDto
  bookDocuments: any[]
}

export interface Trip {
  id: number
  name: string
  address: string
  rating: number
  price: number
  childPrice: number
  isActive: boolean
  fromLocation: string
  toLocation: string
  numberOfDays: number
  startDate: string
  endDate: string
  capacity: number
  remainingSeats: number
  isExternallTrip: boolean
  isRecommended: boolean
  isFake: boolean
  externalLink: string
  isFav: boolean
  isBlocked: boolean
  isIncludeVate: boolean
  cancellationPolicy: string
  isRefundable: boolean
  minimumDaysToRefund: number
  isAllowPaymentUponArrival: boolean
  depositRate: number
  images: any[]
}

// --- Outing Reservation Interfaces ---

export interface OutingReservation {
  quantity: number
  ticketPrice: number
  totalPrice: number
  outingId: number
  outingTicketId: number
  customerBookingId: number
  id: number
  reservationDate: string
  numberOfSeats: number
  bookingId: number
  couponRate: number
  from: string
  to: string
  allowedToSettlement: boolean
  allowedToRefund: boolean
  isPartial: boolean
  depositRate: number
  depositValue: number
  productPrice: number
  salesTaxRate: number
  salesTaxValue: number
  priceAfterSalesTax: number
  tripsRate: number
  tripsValue: number
  vendorProfitBeforeCoupon: number
  couponCode: string
  couponValue: number
  tripsProfitAfterCoupon: number
  vendorProfitAfterCoupon: number
  clientPaid: number
  vendorRemainingFromTrips: number
  salesRate: number
  salesRateValue: number
  tripsProfitAfterSalesRate: number
  isSalesSettled: boolean
  isVendorSettled: boolean
  couponType: any
  isVatIncluded: boolean
  tripsCommissionVatRate: number
  tripsCommissionVatValue: number
  isCommissionSalesSettled: boolean
  tripsProfiteAfterCommissionVat: number
  bookingRefernce: string
  pricePayed: number
  status: number
  countDetails: CountDetails
  outing: Outing
  user: User
  companyDto: CompanyDto
  autoCancelledDate: string
  isAutoCancelled: boolean
  tecket: Ticket
  outingTicketSerialNumbers: OutingTicketSerialNumber[]
}

export interface Outing {
  id: number
  name: string
  description: string
  location: string
  startDate: string
  endDate: string
  rating: number
  targetAudience: string
  imageUrl: string
  isActive: boolean
  isBlocked: boolean
  outingCategoryId: number
  outingCategoryName: any
  vendorId: number
  vendorName: string
  outingCategory: any
  vendor: Vendor
  tickets: Ticket[]
  addOns: any[]
  features: any[]
  offers: any[]
  reviews: any[]
  images: Image[]
  maxPrice: number
  miniPrice: number
  isFav: boolean
  depositRate: any
  cancellationPolicy: any
  isRefundable: boolean
  minimumDaysToRefund: any
  savingsRatio: any
}

export interface Vendor {
  id: number
  name: string
  description: string
  logoUrl: string
  email: string
  address: string
  phone: string
  isBlocked: boolean
}

export interface Ticket {
  id: number
  ticketType: string
  description: string
  price: number
  childPrice: any
  availableQuantity: number
  isActive: boolean
  outingId: number
  hasSerialNumber: boolean
  outingTicketSerialNumbers: any[]
}

export interface Image {
  id: number
  url: string
  altText: string
  isPrimary: boolean
  outingId: number
}

export interface OutingTicketSerialNumber {
  serialNumber: string
  isUsed: boolean
}

// --- Hajj Reservation Interfaces (NEW) ---

export interface HajjReservation {
  id: number
  reservationDate: string
  numberOfSeats: number
  bookingId: number
  couponRate: number
  from: string
  to: string
  allowedToSettlement: boolean
  allowedToRefund: boolean
  isPartial: boolean
  depositRate: number
  depositValue: number
  productPrice: number
  salesTaxRate: number
  salesTaxValue: number
  priceAfterSalesTax: number
  tripsRate: number
  tripsValue: number
  vendorProfitBeforeCoupon: number
  couponCode: string
  couponValue: number
  tripsProfitAfterCoupon: number
  vendorProfitAfterCoupon: number
  clientPaid: number
  vendorRemainingFromTrips: number
  salesRate: number
  salesRateValue: number
  tripsProfitAfterSalesRate: number
  isSalesSettled: boolean
  isVendorSettled: boolean
  couponType: any
  isVatIncluded: boolean
  tripsCommissionVatRate: number
  tripsCommissionVatValue: number
  isCommissionSalesSettled: boolean
  tripsProfiteAfterCommissionVat: number
  bookingRefernce: string
  pricePayed: number
  status: number
  countDetails: CountDetails
  hajj: Hajj
  user: User
  companyDto: CompanyDto
  bookDocuments: any[]
  autoCancelledDate: string
  isAutoCancelled: boolean
}

export interface Hajj {
  id: number
  name: string
  rating: number
  price: number
  childPrice: number
  isActive: boolean
  daysInMakkah: number
  daysInMadinah: number
  residenceInMakkah: string
  residenceInMadinah: string
  flightLine: string
  numberOfDays: number
  type: number
  startDate: string
  endDate: string
  capacity: number
  remainingSeats: number
  isRecommended: boolean
  isFake: boolean
  externalLink: string
  isFav: boolean
  isBlocked: boolean
  isIncludeVate: boolean
  fromLocation: string
  toLocation: string
  cancellationPolicy: string
  isRefundable: boolean
  minimumDaysToRefund: number
  isAllowPaymentUponArrival: boolean
  depositRate: number
  images: any[]
  tickets: any[]
}