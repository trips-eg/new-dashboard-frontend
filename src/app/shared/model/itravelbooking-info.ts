


export interface ItravelbookingInfo {
  reservationDate: Date;
  numberOfSeats:   number;
  trip:            Trip;
  user:            User;
}

export interface Trip {
  id:              number;
  name:            string;
  address:         string;
  rating:          number;
  price:           number;
  isActive:        boolean;
  fromLocation:    string;
  toLocation:      string;
  numberOfDays:    number;
  startDate:       Date;
  endDate:         Date;
  capacity:        number;
  remainingSeats:  number;
  isExternallTrip: boolean;
}

export interface User {
  name:        null;
  email:       string;
  userName:    string;
  phoneNumber: string;
  deviceToken: string;
  imageUrl:    string;
  iActive:     boolean;
}
