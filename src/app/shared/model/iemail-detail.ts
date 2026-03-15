export interface EmailDetailResponse {
  success: boolean;
  data: EmailDetail;
  message: any;
}

export interface EmailDetail {
  id: number;
  name: string;
  userId: number;
  fromEmail: string;
  email: string;
  purpose: number;
  type: number;
  template: string;
  handlebars: string;
  isSend: boolean;
  dateCreated: string;
  dateUpdated: string;
  context: string;
}
