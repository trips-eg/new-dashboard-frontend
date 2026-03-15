export class FilterMap {
  roomId?: number;
  UserId?: number;
  VendorId?: number;
  isPagingEnabled?: boolean;
  pageIndex?: number;
  pageSize?: number;
  CountryCode?: string;
  HotelId?: number;
  sort?: string;
  search?: string;
  Search?: string;
  cityId?: number;
  countryId?: number;
  CountryId?: number;
  createdUserId?: number;
  modUserId?: number;
  rating?: number;
  fromDate?: string;
  toDate?: string;
  isExternalTrip?: boolean;
  fromLocation?: string;
  toLocation?: string;
  numberOfDays?: number;
  CheckIn?: string;
  CheckOut?: string;
  PhoneNumber?: string;
  BookingRefernce?: string;
  CompanyId?: number;
  Type?: number;
  LogId?: number;
}
export class FilterTravelMap {
  isPagingEnabled?: boolean;
  pageIndex?: number;
  pageSize?: number;
  CompanyId?: number;
  sort?: string;
  Search?: string;
  CityId?: number;
  CountryId?: number;
  CountryCode?: string;
  Rating?: number;
  FromDate?: string;
  ToDate?: string;
  IsExternalTrip?: boolean;
  FromLocation?: string;
  ToLocation?: string;
  NumberOfDays?: number;
  SeatsCount?: number;
}

export interface FilterItem {
  column: string;
  value: any;
}

export interface BaseSearchCriteria {
  isPagingEnabled: boolean;
  pageIndex: number;
  pageSize: number;
  search?: string;
  sortDirection?: string; // "asc" | "desc"
  sortColumn?: string;
  filters?: FilterItem[];
  companyId?: number;
}
