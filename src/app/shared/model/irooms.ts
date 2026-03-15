
export interface Irooms {
  id:                 number;
  name:               string;
  description:        string;
  size:               number;
  bedCount:           number;
  price:              number;
  cancellationPolicy: string;
  boarding:           string;
  availableFrom:      Date;
  availableTo:        Date;
  hotelId:            number;
  hotel:              string;
  roomTypeId:         number;
  roomType:           string;
  bedTypeId:          number;
  bedType:            string;
  features:           any[];
  images:             any[];
}

