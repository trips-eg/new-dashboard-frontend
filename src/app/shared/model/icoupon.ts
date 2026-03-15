
export interface ICoupon {
  id:             number;
  code:           string;
  description:    string;
  discountType:   number;
  discountAmount: number;
  usageNumber:    number;
  startDate:      Date;
  endDate:        Date;
  isGenral:       boolean;
  userLimit:      number;
}


