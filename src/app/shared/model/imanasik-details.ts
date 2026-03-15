export interface Imanasik {
  vendorId: number;
  countryId: null;
  country: null;
  cityId: null;
  city: null;
  descriptions: Description[];
  segments: Segment[];
  isInCart: boolean;
  companyDto: null;
  id: number;
  name: string;
  rating: number;
  price: number;
  childPrice: number;
  isActive: boolean;
  daysInMakkah: number;
  daysInMadinah: number;
  residenceInMakkah: string;
  residenceInMadinah: string;
  flightLine: string;
  numberOfDays: number;
  type: number;
  startDate: string;
  endDate: string;
  capacity: number;
  remainingSeats: number;
  isRecommended: boolean;
  isFake: boolean;
  externalLink: string;
  isFav: boolean;
  isBlocked: boolean;
  isIncludeVate: boolean;
  cancellationPolicy: string;
  isRefundable: boolean;
  minimumDaysToRefund: number;
  isAllowPaymentUponArrival: boolean;
  depositRate: number;
  images: Image[];
  tickets: any[];
}

interface Image {
  id: number;
  imageUrl: string;
  isFavoriteImage: boolean;
  hajjId: number;
}

interface Segment {
  id: number;
  type: number;
  typeObj: TypeObj;
  title: string;
  details: string;
  time: string;
  fromLocation: string;
  toLocation: string;
  fromTime: string;
  toTime: string;
  latitude: string;
  longitude: string;
  tripId: number;
  stepDescriptions: Description[];
}

interface TypeObj {
  value: number;
  nameEn: string;
  nameAr: string;
}

interface Description {
  id: number;
  description: string;
}
