
export interface ISideBar {
  id: number
  title: string
  color: string
  squence: number
  isActive: boolean
  sideBarItems: SideBarItem[]
}

export interface SideBarItem {
  id: number
  squence: number
  sideBarItemType: number
  outing?: Outing
  hajj?: Hajj
  trip: any
  room?: Room
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
  vendorName: any
  outingCategory: any
  vendor: any
  tickets: any[]
  addOns: any[]
  features: any[]
  offers: any[]
  reviews: any[]
  images: any[]
  maxPrice: number
  miniPrice: number
  isFav: boolean
  depositRate: any
  cancellationPolicy: any
  isRefundable: boolean
  minimumDaysToRefund: any
  savingsRatio: any
  outingType: number
  outingSchedules: any[]
  branshes: any[]
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

export interface Room {
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
  hotel: any
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
  companyDto: any
}

export interface BordingObj {
  value: number
  nameEn: any
  nameAr: any
}
