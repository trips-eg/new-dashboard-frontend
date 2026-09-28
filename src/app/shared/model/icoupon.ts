
export enum CouponScope {
  Specific = 1,
  General = 2,
  AppliedOnSpecificItems = 3
}

export interface ICoupon {
  id:             number;
  code:           string;
  description:    string;
  warningMessage?: string | null;
  scope?:         CouponScope;
  discountType:   number;
  discountAmount: number;
  usageNumber:    number;
  startDate:      Date;
  endDate:        Date;
  isGenral:       boolean;
  userLimit:      number;
  buyQuantity?:   number;
  getQuantity?:   number;
  maxFreeQuantity?: number;
  userId?:        number | null;
  isRecoveryOffer?: boolean;
  recoveryDiscountPercentage?: number | null;
  discountDescription?: string;
}


