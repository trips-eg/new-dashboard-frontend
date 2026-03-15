

export interface Ihotel {
  id:           number;
  cityId:       number;
  cityName:     string;
  countryId:    number;
  countryName:  string;
  name:         string;
  description:  string;
  rating:       number;
  mainImageUrl: string;
  phone:        string;
  address:      string;
  status:       boolean;
  rooms:        Room[];
}

export interface Room {
  id:                        number;
  name:                      string;
  description:               string;
  size:                      number;
  bedCount:                  number;
  price:                     number;
  cancellationPolicy:        string;
  isRefundable:              boolean;
  minimumDaysToRefund:       null;
  isAllowPaymentUponArrival: boolean;
  depositRate:               number;
  boarding:                  string;
  availableFrom:             Date;
  availableTo:               Date;
  hotelId:                   number;
  hotel:                     string;
  roomTypeId:                number;
  roomType:                  string;
  bedTypeId:                 number;
  bedType:                   null;
  features:                  number[];
  images:                    any[];
}


