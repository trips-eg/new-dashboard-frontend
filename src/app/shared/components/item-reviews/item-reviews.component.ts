import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { Subject, Subscription, finalize, takeUntil } from 'rxjs';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { CreateReviewDto, REVIEW_ADMIN_ROLES, ReviewDto, ReviewItemType } from '../../model/review.model';
import { ReviewsService } from '../../services/reviews.service';

function customerNameValidator(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim() ? null : { required: true };
}
function starsValidator(control: AbstractControl): ValidationErrors | null {
  return Number.isInteger(control.value) && control.value >= 1 && control.value <= 5 ? null : { stars: true };
}

@Component({
  selector: 'app-item-reviews',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DialogModule],
  templateUrl: './item-reviews.component.html',
  styleUrl: './item-reviews.component.scss'
})
export class ItemReviewsComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) itemType!: ReviewItemType;
  @Input({ required: true }) itemId!: number;
  @Input() itemName = '';
  private readonly service = inject(ReviewsService);
  private readonly config = inject(ConfigureService);
  readonly translate = inject(TranslateService);
  private readonly contextChanged = new Subject<void>();
  private listRequest?: Subscription;
  readonly stars = [1, 2, 3, 4, 5];
  readonly pageSize = 6;
  readonly form = new FormGroup({
    customerName: new FormControl('', { nonNullable: true, validators: [customerNameValidator] }),
    stars: new FormControl<number | null>(null, [Validators.required, starsValidator]),
    comment: new FormControl('', { nonNullable: true })
  });
  reviews: ReviewDto[] = [];
  filteredReviews: ReviewDto[] = [];
  average = 0;
  distribution: { stars: number; count: number; percentage: number }[] = [];
  ratingFilter = 0;
  sortOrder = 'newest';
  page = 0;
  loading = false;
  loadError = '';
  feedback = '';
  editorVisible = false;
  editingReview: ReviewDto | null = null;
  deletingReview: ReviewDto | null = null;
  deleteVisible = false;
  saving = false;
  deleting = false;
  formError = '';
  deleteError = '';

  get canManage(): boolean {
    return !!this.config.UserToken() && this.config.userRoles().some((role) => REVIEW_ADMIN_ROLES.includes(role));
  }
  get rtl(): boolean {
    return this.translate.currentLang === 'ar';
  }
  get visibleReviews(): ReviewDto[] {
    return this.filteredReviews.slice(this.page * this.pageSize, (this.page + 1) * this.pageSize);
  }
  get pageCount(): number {
    return Math.max(1, Math.ceil(this.filteredReviews.length / this.pageSize));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['itemId'] && !changes['itemType']) return;
    this.contextChanged.next();
    this.listRequest?.unsubscribe();
    this.reviews = [];
    this.editorVisible = this.deleteVisible = false;
    this.editingReview = this.deletingReview = null;
    this.feedback = '';
    this.ratingFilter = this.page = 0;
    this.updateSummary();
    this.loadReviews();
  }
  loadReviews(): void {
    this.listRequest?.unsubscribe();
    if (!Number.isInteger(Number(this.itemId)) || Number(this.itemId) <= 0 || !['Trip', 'Outing', 'HajjUmrah'].includes(this.itemType))
      return;
    this.loading = true;
    this.loadError = '';
    this.listRequest = this.service
      .list(this.itemType, Number(this.itemId))
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (reviews) => {
          this.reviews = reviews;
          this.updateSummary();
        },
        error: (error) => (this.loadError = this.errorMessage(error, 'REVIEWS.LOAD_ERROR'))
      });
  }
  private updateSummary(): void {
    this.average = this.reviews.length ? this.reviews.reduce((total, review) => total + review.stars, 0) / this.reviews.length : 0;
    this.distribution = [...this.stars].reverse().map((stars) => {
      const count = this.reviews.filter((review) => review.stars === stars).length;
      return { stars, count, percentage: this.reviews.length ? (count / this.reviews.length) * 100 : 0 };
    });
    this.applyFilters(false);
  }
  setRatingFilter(value: string): void {
    this.ratingFilter = Number(value);
    this.applyFilters();
  }
  setSortOrder(value: string): void {
    this.sortOrder = value;
    this.applyFilters();
  }
  private applyFilters(resetPage = true): void {
    this.filteredReviews = this.reviews
      .filter((review) => !this.ratingFilter || review.stars === this.ratingFilter)
      .sort((a, b) => {
        const difference = (Date.parse(a.createdAt || '') || 0) - (Date.parse(b.createdAt || '') || 0) || a.id - b.id;
        return this.sortOrder === 'oldest' ? difference : -difference;
      });
    this.page = resetPage ? 0 : Math.min(this.page, this.pageCount - 1);
  }
  openEditor(review: ReviewDto | null = null): void {
    if (!this.canManage || this.saving || this.deleting) return;
    this.editingReview = review;
    this.form.reset({ customerName: review?.customerName || '', stars: review?.stars ?? null, comment: review?.comment || '' });
    this.formError = this.feedback = '';
    this.editorVisible = true;
  }
  save(): void {
    if (!this.canManage || this.saving || !Number.isInteger(Number(this.itemId)) || Number(this.itemId) <= 0) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const values = this.form.getRawValue();
    const fields = { customerName: values.customerName.trim(), stars: values.stars!, comment: values.comment.trim() };
    const editing = !!this.editingReview;
    const request = this.editingReview
      ? this.service.update(this.editingReview.id, fields)
      : this.service.create({ ...fields, comment: fields.comment || null, ...this.itemReference() } as CreateReviewDto);
    this.saving = true;
    this.formError = '';
    request
      .pipe(
        takeUntil(this.contextChanged),
        finalize(() => (this.saving = false))
      )
      .subscribe({
        next: () => {
          this.editorVisible = false;
          this.feedback = editing ? 'REVIEWS.UPDATED' : 'REVIEWS.CREATED';
          this.loadReviews();
        },
        error: (error) => (this.formError = this.errorMessage(error, 'REVIEWS.SAVE_ERROR'))
      });
  }
  askDelete(review: ReviewDto): void {
    if (!this.canManage || this.saving || this.deleting) return;
    this.deletingReview = review;
    this.deleteError = this.feedback = '';
    this.deleteVisible = true;
  }
  confirmDelete(): void {
    if (!this.canManage || !this.deletingReview || this.deleting) return;
    this.deleting = true;
    this.deleteError = '';
    this.service
      .delete(this.deletingReview.id)
      .pipe(
        takeUntil(this.contextChanged),
        finalize(() => (this.deleting = false))
      )
      .subscribe({
        next: () => {
          this.deleteVisible = false;
          this.feedback = 'REVIEWS.DELETED';
          this.loadReviews();
        },
        error: (error) => (this.deleteError = this.errorMessage(error, 'REVIEWS.DELETE_ERROR'))
      });
  }
  private itemReference(): { tripId: number } | { outingId: number } | { hajjUmrahPackageId: number } {
    const id = Number(this.itemId);
    if (this.itemType === 'Trip') return { tripId: id };
    if (this.itemType === 'Outing') return { outingId: id };
    return { hajjUmrahPackageId: id };
  }
  private errorMessage(error: any, fallback: string): string {
    if (error?.status === 401) return 'REVIEWS.SESSION_ERROR';
    if (error?.status === 403) return 'REVIEWS.PERMISSION_ERROR';
    if (error?.status === 0) return 'REVIEWS.NETWORK_ERROR';
    const validationErrors = error?.error?.errors;
    const firstValidation =
      validationErrors &&
      Object.values(validationErrors)
        .flat()
        .find((value) => typeof value === 'string');
    return error?.error?.message || firstValidation || (error instanceof Error ? error.message : '') || fallback;
  }
  trackReview(_index: number, review: ReviewDto): number {
    return review.id;
  }
  ngOnDestroy(): void {
    this.contextChanged.next();
    this.contextChanged.complete();
    this.listRequest?.unsubscribe();
  }
}
