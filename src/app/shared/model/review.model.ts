// Named types are verified against the deployed API; the guide's numeric
// mapping conflicts with Swagger. Do not reuse other features' item enums.
export type ReviewItemType = 'Trip' | 'Outing' | 'HajjUmrah';

export interface ReviewDto {
  id: number;
  customerName: string | null;
  stars: number;
  comment: string | null;
  createdAt: string | null;
  userId: number | null;
}
export interface ReviewFields {
  customerName: string;
  stars: number;
  comment: string | null;
}
export type CreateReviewDto = ReviewFields &
  (
    | { tripId: number; outingId?: never; hajjUmrahPackageId?: never }
    | { outingId: number; tripId?: never; hajjUmrahPackageId?: never }
    | { hajjUmrahPackageId: number; tripId?: never; outingId?: never }
  );
export interface UpdateReviewDto {
  customerName?: string;
  stars?: number;
  comment?: string | null;
}
export interface ReviewListResponse {
  success: boolean;
  count: number;
  data: ReviewDto[];
  message?: string;
}
export interface ReviewMutationResponse {
  success: boolean;
  data?: ReviewDto | null;
  message?: string;
}
export const REVIEW_ADMIN_ROLES: readonly string[] = ['Admin.Super', 'Admin.Manager', 'Admin.Support'];
