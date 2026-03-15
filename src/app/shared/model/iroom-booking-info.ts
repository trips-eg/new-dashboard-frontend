
export interface IroomBookingInfo {
  id:        number;
  userId:    number;
  user:      string;
  roomId:    number;
  room:      string;
  hotelId:   number;
  hotel:     string;
  price:     number;
  startDate: Date;
  endDate:   Date;
  status:    number;
}

