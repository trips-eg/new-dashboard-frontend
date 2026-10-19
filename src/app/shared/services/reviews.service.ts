import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import {
  CreateReviewDto,
  ReviewDto,
  ReviewItemType,
  ReviewListResponse,
  ReviewMutationResponse,
  UpdateReviewDto
} from '../model/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private readonly endpoint = APIs.reviews.base;
  constructor(private readonly api: ApiCallerService) {}

  list(type: ReviewItemType, itemId: number): Observable<ReviewDto[]> {
    return (this.api.get(`${this.endpoint}/${type}/${itemId}`) as Observable<ReviewListResponse>).pipe(
      map((response) => {
        if (!response?.success || !Array.isArray(response.data)) throw new Error(response?.message || 'REVIEWS.LOAD_ERROR');
        return response.data;
      })
    );
  }
  create(data: CreateReviewDto): Observable<void> {
    return (this.api.post(this.endpoint, data) as Observable<ReviewDto | ReviewMutationResponse>).pipe(
      map((response) => this.assertSuccess(response))
    );
  }
  update(id: number, data: UpdateReviewDto): Observable<void> {
    return (this.api.put(`${this.endpoint}/${id}`, data) as Observable<ReviewDto | ReviewMutationResponse>).pipe(
      map((response) => this.assertSuccess(response))
    );
  }
  delete(id: number): Observable<void> {
    return (this.api.delete(`${this.endpoint}/${id}`) as Observable<ReviewMutationResponse>).pipe(
      map((response) => this.assertSuccess(response))
    );
  }
  private assertSuccess(response: ReviewDto | ReviewMutationResponse): void {
    if (!response || ('success' in response ? response.success !== true : !Number.isInteger(response.id))) {
      throw new Error((response && 'message' in response && response.message) || 'REVIEWS.SAVE_ERROR');
    }
  }
}
