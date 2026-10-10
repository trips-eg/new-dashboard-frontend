import { Component, OnInit, inject } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { TripStarDto, TripStarItemDto, TripStarReorderItem } from 'src/app/shared/model/trip-star.model';
import { TripStarService } from 'src/app/shared/services/trip-star.service';
import { tripStarError, tripStarImageUrl, tripStarStatus } from 'src/app/shared/utils/trip-star.utils';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { Permissions } from 'src/app/theme/layout/admin/navigation/navigation';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-trip-stars',
  standalone: true,
  imports: [SharedModule, DragDropModule],
  providers: [ConfirmationService],
  templateUrl: './trip-stars.component.html',
  styleUrl: './trip-stars.component.scss'
})
export class TripStarsComponent implements OnInit {
  private readonly service = inject(TripStarService);
  private readonly config = inject(ConfigureService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastrService);
  private readonly confirm = inject(ConfirmationService);
  readonly translate = inject(TranslateService);

  private listSequence = 0;
  cards: TripStarDto[] = [];
  totalRecords = 0;
  first = 0;
  rows = 20;
  search = '';
  activeFilter: boolean | null = null;
  direction: 'Asc' | 'Desc' = 'Asc';
  loading = false;
  loadError: string | null = null;
  saving = false;
  cardOrderVisible = false;
  itemOrderVisible = false;
  orderedCards: TripStarDto[] = [];
  orderedItems: TripStarItemDto[] = [];
  orderedCard: TripStarDto | null = null;

  get canCreate(): boolean { return this.hasPermission(Permissions.ADCreate); }
  get canEdit(): boolean { return this.hasPermission(Permissions.ADEdit); }
  get canDelete(): boolean { return this.hasPermission(Permissions.ADDelete); }
  get isArabic(): boolean { return this.translate.currentLang?.startsWith('ar') ?? false; }
  get hasFilters(): boolean { return !!this.search.trim() || this.activeFilter !== null || this.direction !== 'Asc'; }

  ngOnInit(): void { this.load(); }

  private hasPermission(permission: string): boolean {
    return this.config.userPermissions().includes(permission);
  }

  title(card: TripStarDto): string {
    return (this.isArabic ? card.titleAr || card.title : card.title || card.titleAr) || `#${card.id}`;
  }

  image(path: string | null): string | null { return tripStarImageUrl(path); }
  status(card: TripStarDto): string { return `TripStar.${tripStarStatus(card)}`; }
  statusKey(card: TripStarDto): string { return tripStarStatus(card); }
  statusSeverity(card: TripStarDto): 'success' | 'warning' | 'danger' | 'info' {
    switch (tripStarStatus(card)) {
      case 'active': return 'success';
      case 'expired': return 'danger';
      case 'reactivated': return 'info';
      default: return 'warning';
    }
  }

  load(): void {
    const sequence = ++this.listSequence;
    this.loading = true;
    this.loadError = null;
    this.service.list({
      pageIndex: Math.floor(this.first / this.rows) + 1,
      pageSize: this.rows,
      Search: this.search.trim() || undefined,
      IsActive: this.activeFilter ?? undefined,
      SortDirection: this.direction
    }).subscribe({
      next: (response) => {
        if (sequence !== this.listSequence) return;
        this.loading = false;
        if (!response.success) { this.loadError = response.message || 'Something went wrong'; this.toast.error(this.loadError); return; }
        this.cards = response.data?.data || [];
        this.totalRecords = response.data?.itemsCount || 0;
      },
      error: (error) => { if (sequence !== this.listSequence) return; this.loading = false; this.loadError = tripStarError(error); this.toast.error(this.loadError); }
    });
  }

  filterChanged(): void { this.first = 0; this.load(); }
  clearFilters(): void {
    this.search = '';
    this.activeFilter = null;
    this.direction = 'Asc';
    this.filterChanged();
  }
  pageChanged(event: { first?: number; rows?: number }): void {
    this.first = event.first || 0;
    this.rows = event.rows || 20;
    this.load();
  }
  create(): void { this.router.navigate(['/trip-stars/new']); }
  details(id: number): void { this.router.navigate(['/trip-stars', id]); }
  edit(id: number): void { this.router.navigate(['/trip-stars', id, 'edit']); }

  toggle(card: TripStarDto): void {
    if (!this.canEdit) return;
    this.confirm.confirm({
      header: this.translate.instant('TripStar.confirmStatusTitle'),
      message: this.translate.instant('TripStar.confirmStatus'),
      accept: () => {
        this.saving = true;
        this.service.toggle(card.id).subscribe({
          next: (response) => {
            this.saving = false;
            if (!response.success) { this.toast.error(response.message || 'Something went wrong'); return; }
            this.toast.success(response.message || this.translate.instant('TripStar.saved'));
            this.load();
          },
          error: (error) => { this.saving = false; this.toast.error(tripStarError(error)); }
        });
      }
    });
  }

  delete(card: TripStarDto): void {
    if (!this.canDelete) return;
    this.confirm.confirm({
      header: this.translate.instant('TripStar.delete'),
      message: this.translate.instant('TripStar.confirmDelete', { name: this.title(card) }),
      accept: () => {
        this.saving = true;
        this.service.delete(card.id).subscribe({
          next: (response) => {
            this.saving = false;
            if (!response.success) { this.toast.error(response.message || 'Something went wrong'); return; }
            this.toast.success(response.message || this.translate.instant('TripStar.saved'));
            if (this.cards.length === 1 && this.first > 0) this.first = Math.max(0, this.first - this.rows);
            this.load();
          },
          error: (error) => { this.saving = false; this.toast.error(tripStarError(error)); }
        });
      }
    });
  }

  openCardOrder(): void {
    if (!this.canEdit) return;
    this.loading = true;
    this.service.list({ isPagingEnabled: false, SortDirection: 'Asc' }).subscribe({
      next: (response) => {
        this.loading = false;
        if (!response.success) { this.toast.error(response.message || 'Something went wrong'); return; }
        this.orderedCards = [...(response.data?.data || [])];
        this.cardOrderVisible = true;
      },
      error: (error) => { this.loading = false; this.toast.error(tripStarError(error)); }
    });
  }

  openItemOrder(card: TripStarDto): void {
    if (!this.canEdit) return;
    this.loading = true;
    this.service.get(card.id).subscribe({
      next: (response) => {
        this.loading = false;
        if (!response.success || !response.data) { this.toast.error(response.message || 'Something went wrong'); return; }
        this.orderedCard = response.data;
        this.orderedItems = [...response.data.items];
        this.itemOrderVisible = true;
      },
      error: (error) => { this.loading = false; this.toast.error(tripStarError(error)); }
    });
  }

  dropCards(event: CdkDragDrop<TripStarDto[]>): void { moveItemInArray(this.orderedCards, event.previousIndex, event.currentIndex); }
  dropItems(event: CdkDragDrop<TripStarItemDto[]>): void { moveItemInArray(this.orderedItems, event.previousIndex, event.currentIndex); }
  moveCard(index: number, delta: number): void {
    const next = index + delta;
    if (next >= 0 && next < this.orderedCards.length) moveItemInArray(this.orderedCards, index, next);
  }
  moveItem(index: number, delta: number): void {
    const next = index + delta;
    if (next >= 0 && next < this.orderedItems.length) moveItemInArray(this.orderedItems, index, next);
  }

  saveCardOrder(): void {
    if (!this.canEdit || this.saving) return;
    const request: TripStarReorderItem[] = this.orderedCards.map((card, displayOrder) => ({ id: card.id, displayOrder }));
    this.saving = true;
    this.service.reorderCards(request).subscribe({
      next: (response) => {
        this.saving = false;
        if (!response.success) { this.toast.error(response.message || 'Something went wrong'); return; }
        this.cardOrderVisible = false;
        this.toast.success(response.message || this.translate.instant('TripStar.saved'));
        this.load();
      },
      error: (error) => { this.saving = false; this.toast.error(tripStarError(error)); }
    });
  }

  saveItemOrder(): void {
    if (!this.canEdit || !this.orderedCard || this.saving) return;
    const request: TripStarReorderItem[] = this.orderedItems.map((item, displayOrder) => ({ id: item.id, displayOrder }));
    this.saving = true;
    this.service.reorderItems(this.orderedCard.id, request).subscribe({
      next: (response) => {
        this.saving = false;
        if (!response.success) { this.toast.error(response.message || 'Something went wrong'); return; }
        this.itemOrderVisible = false;
        this.toast.success(response.message || this.translate.instant('TripStar.saved'));
        this.load();
      },
      error: (error) => { this.saving = false; this.toast.error(tripStarError(error)); }
    });
  }
}
