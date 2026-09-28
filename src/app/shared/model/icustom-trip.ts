import { CustomTripRequestStatus, CustomTripType, OfferPaymentType, VendorTripOfferStatus } from '../Enums/custom-trip';

// Shape of the ApiResponse<T> envelope used by the backend
export interface IApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// VendorTripRequestListDtoPagination — count and itemsCount are both present;
// read totals with `count ?? itemsCount` to be safe.
export interface IPaginated<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  pagesCount?: number;
  itemsCount?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  data: T[];
}

export interface ICustomTripSetting {
  id: number;
  settingTypeId: number;
  settingType?: string;
  nameEn?: string;
  nameAr?: string;
  value: number;
}

export interface ICustomTripSettingUpdate {
  id: number;
  value: number;
}

export interface IFilterSearch {
  column?: string | null;
  value?: string | null;
}

export interface IVendorTripRequestsQuery {
  pageIndex: number;
  pageSize: number;
  tripType?: CustomTripType | null;
  destination?: string | null;
  search?: string | null;
  sortColumn?: string | null;
  sortDirection?: string | null;
  filters?: IFilterSearch[] | null;
  fromDate?: string | null;
  toDate?: string | null;
}

export interface IVendorTripRequest {
  id: number;
  tripType: CustomTripType;
  destination?: string;
  travelDate: string;
  numberOfDays: number;
  numberOfAdults: number;
  numberOfChildren: number;
  hotelName?: string;
  needsFlight: boolean;
  needsVisa: boolean;
  additionalNotes?: string;
  status: CustomTripRequestStatus;
  createdDate: string;
  offerWindowExpiresAt: string;
  isAcceptingOffers: boolean;
  myOfferStatus?: VendorTripOfferStatus;
  myOfferPrice?: number;
  myOfferPaymentType?: OfferPaymentType;
  myOfferDepositAmount?: number;
}

export interface IVendorTripRequestDetails extends IVendorTripRequest {
  childrenAges?: number[];
}

export interface ICreateVendorTripOffer {
  customTripRequestId: number;
  vendorId?: number;
  price: number;
  vendorNotes?: string;
  paymentType: OfferPaymentType;
  depositAmount?: number;
}

export interface IVendorTripOffer {
  id: number;
  customTripRequestId: number;
  vendorId: number;
  price: number;
  vendorNotes?: string;
  paymentType: OfferPaymentType;
  depositAmount?: number;
  status: VendorTripOfferStatus;
  createdDate: string;
}

export interface IAdminVendorOffer {
  id: number;
  vendorId: number;
  vendorName?: string;
  vendorLogoUrl?: string;
  price: number;
  vendorNotes?: string;
  paymentType: OfferPaymentType;
  paymentTypeName?: string;
  depositAmount?: number;
  status: VendorTripOfferStatus;
  statusName?: string;
  createdDate: string;
}

export interface IAdminCustomTripRequest {
  id: number;
  customerId: number;
  customerName?: string;
  customerPhone?: string;
  tripType: CustomTripType;
  tripTypeName?: string;
  destination?: string;
  travelDate: string;
  numberOfDays: number;
  numberOfAdults: number;
  numberOfChildren: number;
  childrenAges?: number[];
  hotelName?: string;
  needsFlight: boolean;
  needsVisa: boolean;
  additionalNotes?: string;
  status: CustomTripRequestStatus;
  statusName?: string;
  createdDate: string;
  offerWindowExpiresAt: string;
  remainingSeconds: number;
  isAcceptingOffers: boolean;
  viewsCount: number;
  offersCount: number;
  offers: IAdminVendorOffer[];
}

export interface IVendorOption {
  label: string;
  value: number;
}
