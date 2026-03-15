export interface Travel {
  id?: number
  name?: string
  address?: string
  rating?: number
  price?: number
  startDate?: string
  endDate?: string
  capacity?: number
  remainingSeats?: number
  isExternallTrip?: boolean
  vendorId?: number
  countryId?: number
  country?: Country
  cityId?: number
  city?: City
  isActive?: boolean
  fromLocation?: string
  toLocation?: string
  numberOfDays?: number
  descriptions?: Description[]
  segments?: Segment[]
  images?: Image[]
}

export interface Country {
  id?: number
  name?: string
  countryCode?: string
}

export interface City {
  id?: number
  name?: string
}

export interface Description {
  id?: number
  description?: string
}

export interface Segment {
  id?: number
  type?: number
  typeObj?: TypeObj
  title?: string
  details?: string
  time?: string
  fromLocation?: string
  toLocation?: string
  fromTime?: string
  toTime?: string
  latitude?: string
  longitude?: string
  tripId?: number
  stepDescriptions?: any[]
}

export interface TypeObj {
  value?: number
  nameEn?: string
  nameAr?: string
}

export interface Image {
  imageId?: number
  imagePath?: string
}
