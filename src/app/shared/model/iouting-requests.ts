export interface OutingRequest {
  title: string;
  description: string;
  categoryId: number;
  countryId: number;
  cityId: number;
  vendorId: number;
  startDate: Date;
  endDate: Date;
  rating: number;
  // Add other outing fields as needed
}

export interface OutingAddOnRequest {
  outingId: number;
  addOns: {
    name: string;
    price: number;
    description: string;
  }[];
}

export interface OutingOfferRequest {
  outingId: number;
  offers: {
    name: string;
    discount: number;
    startDate: Date;
    endDate: Date;
  }[];
}

export interface OutingTicketRequest {
  outingId: number;
  tickets: {
    type: string;
    price: number;
    quantity: number;
  }[];
}

export interface OutingResponse {
  id: number;
  success: boolean;
  message: string;
}
