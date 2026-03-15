export interface EmailTrackersResponse {
  success: boolean;
  data: EmailTrackersData;
  message: any;
}

export interface EmailTrackersData {
  pageIndex: number;
  pageSize: number;
  count: number;
  pagesCount: number;
  itemsCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: EmailTracker[];
}

export interface EmailTracker {
  id: number;
  logId: number;
  userId: number;
  fromEmail: string;
  toEmail: string;
  purpose: number;
  isSend: boolean;
  isExpired: boolean;
  dateCreated: string;
  dateUpdated: string;
  context: string;
}
