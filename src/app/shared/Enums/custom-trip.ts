// Mirrors the backend enums (Impact.Domain.Enums). Values verified against
// https://web-api.trips.eg/swagger/v1/swagger.json and the backend source screenshots.

export enum CustomTripType {
  InsideEgypt = 1,
  OutsideEgypt = 2
}

export enum CustomTripRequestStatus {
  Submitted = 1,
  ReceivingOffers = 2,
  Expired = 3, // backend member is "Expired" but its DisplayName is "Closed"
  Cancelled = 4,
  OfferSelected = 5,
  Booked = 6
}

export enum VendorTripOfferStatus {
  Pending = 1,
  Accepted = 2,
  Rejected = 3,
  Selected = 4
}

export enum OfferPaymentType {
  Deposit = 1,
  FullPayment = 2
}

export interface EnumDisplay {
  en: string;
  ar: string;
}

// Labels taken from the backend [DisplayName(en, ar)] attributes.
export const CustomTripTypeLabels: Record<CustomTripType, EnumDisplay> = {
  [CustomTripType.InsideEgypt]: { en: 'Inside Egypt', ar: 'داخل مصر' },
  [CustomTripType.OutsideEgypt]: { en: 'Outside Egypt', ar: 'خارج مصر' }
};

export const CustomTripRequestStatusLabels: Record<CustomTripRequestStatus, EnumDisplay> = {
  [CustomTripRequestStatus.Submitted]: { en: 'Submitted', ar: 'تم التقديم' },
  [CustomTripRequestStatus.ReceivingOffers]: { en: 'Receiving Offers', ar: 'تلقى العروض' },
  [CustomTripRequestStatus.Expired]: { en: 'Closed', ar: 'مغلق' },
  [CustomTripRequestStatus.Cancelled]: { en: 'Cancelled', ar: 'ملغي' },
  [CustomTripRequestStatus.OfferSelected]: { en: 'Offer Selected', ar: 'تم اختيار عرض' },
  [CustomTripRequestStatus.Booked]: { en: 'Booked', ar: 'تم الحجز' }
};

export const VendorTripOfferStatusLabels: Record<VendorTripOfferStatus, EnumDisplay> = {
  [VendorTripOfferStatus.Pending]: { en: 'Pending', ar: 'قيد الانتظار' },
  [VendorTripOfferStatus.Accepted]: { en: 'Accepted', ar: 'مقبول' },
  [VendorTripOfferStatus.Rejected]: { en: 'Rejected', ar: 'مرفوض' },
  [VendorTripOfferStatus.Selected]: { en: 'Selected', ar: 'محدد' }
};

export const OfferPaymentTypeLabels: Record<OfferPaymentType, EnumDisplay> = {
  [OfferPaymentType.Deposit]: { en: 'Deposit', ar: 'عربون' },
  [OfferPaymentType.FullPayment]: { en: 'Full Payment', ar: 'دفع كامل' }
};

// PrimeNG 17 tag severities
export type TagSeverity = 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast';

export const CustomTripRequestStatusSeverity: Partial<Record<CustomTripRequestStatus, TagSeverity>> = {
  [CustomTripRequestStatus.Submitted]: 'info',
  [CustomTripRequestStatus.ReceivingOffers]: 'success',
  [CustomTripRequestStatus.Expired]: 'secondary',
  [CustomTripRequestStatus.Cancelled]: 'danger',
  [CustomTripRequestStatus.OfferSelected]: 'warning',
  [CustomTripRequestStatus.Booked]: 'contrast'
};

export const VendorTripOfferStatusSeverity: Partial<Record<VendorTripOfferStatus, TagSeverity>> = {
  [VendorTripOfferStatus.Pending]: 'warning',
  [VendorTripOfferStatus.Accepted]: 'success',
  [VendorTripOfferStatus.Rejected]: 'danger',
  [VendorTripOfferStatus.Selected]: 'info'
};

export function enumDisplay(
  labels: Record<number, EnumDisplay>,
  value: number | null | undefined,
  lang: string
): string {
  if (value === null || value === undefined) {
    return '-';
  }
  const found = labels[value];
  if (!found) {
    return String(value);
  }
  return lang === 'ar' ? found.ar : found.en;
}

export function enumSeverity(
  severities: Partial<Record<number, TagSeverity>>,
  value: number | null | undefined
): TagSeverity {
  return (value !== null && value !== undefined && severities[value]) || 'info';
}
