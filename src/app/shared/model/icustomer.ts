import { BookingFinancialsDto } from './booking-financials.model';

export interface Icustomer {
  financials?: BookingFinancialsDto | null;
  id: string;
  userName: string;
  name: string;
  gender: string;
  email: string;
  phoneNumber: string;
  createdDate: Date;
  iActive: boolean;
  imageUrl: string;
}
