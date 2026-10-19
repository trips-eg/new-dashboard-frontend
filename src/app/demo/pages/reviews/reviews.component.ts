import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, finalize } from 'rxjs';
import { ItemReviewsComponent } from 'src/app/shared/components/item-reviews/item-reviews.component';
import { ReviewItemType } from 'src/app/shared/model/review.model';
import { HajjUmmrahService } from 'src/app/shared/services/hajj-ummrah.service';
import { OutingService } from 'src/app/shared/services/outing.service';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';

interface ReviewCatalogItem {
  id: number;
  name?: string;
  nameAr?: string;
  title?: string;
}
type CatalogType = 'Trip' | 'Outing' | 'Hajj' | 'Umrah';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, ItemReviewsComponent],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss'
})
export class ReviewsComponent implements OnInit, OnDestroy {
  readonly translate = inject(TranslateService);
  private readonly trips = inject(TravelTripsService);
  private readonly outings = inject(OutingService);
  private readonly packages = inject(HajjUmmrahService);
  private request?: Subscription;
  private selectionTimer?: ReturnType<typeof setTimeout>;
  @ViewChild('selectedHeading') private selectedHeading?: ElementRef<HTMLElement>;
  readonly types: CatalogType[] = ['Trip', 'Outing', 'Hajj', 'Umrah'];
  readonly pageSize = 12;
  type: CatalogType = 'Trip';
  search = '';
  private appliedSearch = '';
  page = 1;
  total = 0;
  items: ReviewCatalogItem[] = [];
  selected: ReviewCatalogItem | null = null;
  loading = false;
  error = '';

  get rtl(): boolean {
    return this.translate.currentLang === 'ar';
  }
  get reviewType(): ReviewItemType {
    return this.type === 'Hajj' || this.type === 'Umrah' ? 'HajjUmrah' : this.type;
  }
  get pageCount(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }
  get detailsRoute(): string {
    return this.type === 'Trip' ? '/travel-details' : this.type === 'Outing' ? '/outing-details' : '/details-manasik';
  }
  name(item: ReviewCatalogItem): string {
    return (this.rtl ? item.nameAr || item.name : item.name || item.nameAr) || item.title || `#${item.id}`;
  }
  ngOnInit(): void {
    this.load();
  }
  selectItem(item: ReviewCatalogItem): void {
    this.selected = item;
    clearTimeout(this.selectionTimer);
    this.selectionTimer = setTimeout(() => {
      const heading = this.selectedHeading?.nativeElement;
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
  }
  changeType(type: string): void {
    if (!this.types.includes(type as CatalogType) || type === this.type) return;
    this.type = type as CatalogType;
    this.selected = null;
    this.search = this.appliedSearch = '';
    this.page = 1;
    this.load();
  }
  find(): void {
    this.appliedSearch = this.search.trim();
    this.page = 1;
    this.load();
  }
  changePage(delta: number): void {
    const next = this.page + delta;
    if (this.loading || next < 1 || next > this.pageCount) return;
    this.page = next;
    this.load();
  }
  load(): void {
    this.request?.unsubscribe();
    this.loading = true;
    this.error = '';
    this.items = [];
    const criteria = { isPagingEnabled: true, pageIndex: this.page, pageSize: this.pageSize, search: this.appliedSearch, filters: [] };
    const request: Observable<any> =
      this.type === 'Trip'
        ? this.trips.getAllTravels(criteria)
        : this.type === 'Outing'
          ? this.outings.getAllOutings(criteria)
          : this.packages.getAllManasik({ ...criteria, Type: this.type === 'Hajj' ? 1 : 2 });
    this.request = request.pipe(finalize(() => (this.loading = false))).subscribe({
      next: (response) => {
        if (response?.success !== true || !Array.isArray(response?.data?.data)) {
          this.error = 'REVIEWS_CATALOG.ERROR';
          this.total = 0;
          return;
        }
        this.items = response.data.data.filter((item: ReviewCatalogItem) => Number.isInteger(item.id) && item.id > 0);
        this.total = Math.max(0, Number(response.data.itemsCount) || 0);
      },
      error: (error) => {
        this.total = 0;
        this.error =
          error.status === 401
            ? 'REVIEWS.SESSION_ERROR'
            : error.status === 403
              ? 'REVIEWS_CATALOG.PERMISSION_ERROR'
              : 'REVIEWS_CATALOG.ERROR';
      }
    });
  }
  ngOnDestroy(): void {
    this.request?.unsubscribe();
    clearTimeout(this.selectionTimer);
  }
}
