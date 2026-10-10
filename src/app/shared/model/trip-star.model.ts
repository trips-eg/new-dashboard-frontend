export enum TripStarEntityType {
  Trip = 1,
  Outing = 2,
  Room = 3,
  HajjUmrah = 4
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export interface TripStarItemDto {
  id: number;
  entityType: TripStarEntityType;
  entityId: number;
  displayOrder: number;
  title: string | null;
  imageUrl: string | null;
  trip: CatalogEntity | null;
  outing: CatalogEntity | null;
  room: CatalogEntity | null;
  hajj: CatalogEntity | null;
}

export interface CatalogEntity {
  id: number;
  name?: string | null;
  nameAr?: string | null;
  title?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  descriptions?: Array<{ description?: string | null }> | null;
  imageUrl?: string | null;
  isActive?: boolean;
  isBlocked?: boolean;
  images?: Array<string | { imageUrl?: string | null; isFavoriteImage?: boolean }> | null;
  fromLocation?: string | null;
  toLocation?: string | null;
  location?: string | null;
  hotel?: string | { name?: string | null; nameAr?: string | null } | null;
  roomType?: string | { name?: string | null; nameAr?: string | null } | null;
  outingCategoryName?: string | null;
  numberOfDays?: number | null;
  startDate?: string | null;
  remainingSeats?: number | null;
  bedCount?: number | null;
  size?: number | null;
  type?: number | null;
  [key: string]: unknown;
}

export interface TripStarDto {
  id: number;
  title: string | null;
  titleAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  isActive: boolean;
  isExpired: boolean;
  displayOrder: number;
  createdDate: string;
  expiryDate: string | null;
  items: TripStarItemDto[];
}

export interface TripStarPage {
  pageIndex: number;
  pageSize: number;
  count: number;
  pagesCount: number;
  itemsCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: TripStarDto[];
}

export interface TripStarFilter {
  pageIndex?: number;
  pageSize?: number;
  isPagingEnabled?: boolean;
  Search?: string;
  IsActive?: boolean;
  TripStarId?: number;
  SortDirection?: 'Asc' | 'Desc';
}

export interface TripStarFormValue {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  linkUrl: string;
  displayOrder: number;
  expiryDate: Date | null;
}

export interface SelectedTripStarItem {
  type: TripStarEntityType;
  entityId: number;
  itemId?: number;
  title: string;
  imageUrl: string | null;
  entity: CatalogEntity | null;
}

export interface TripStarReorderItem {
  id: number;
  displayOrder: number;
}
