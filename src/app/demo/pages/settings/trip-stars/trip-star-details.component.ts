import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SelectedTripStarItem, TripStarDto, TripStarEntityType } from 'src/app/shared/model/trip-star.model';
import { TripStarService } from 'src/app/shared/services/trip-star.service';
import { parseLocalDate, selectedFromDto, tripStarError, tripStarImageUrl, tripStarItemWarning, tripStarStatus } from 'src/app/shared/utils/trip-star.utils';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { Permissions } from 'src/app/theme/layout/admin/navigation/navigation';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TripStarMobilePreviewComponent } from './trip-star-mobile-preview.component';

@Component({
  selector: 'app-trip-star-details',
  standalone: true,
  imports: [SharedModule, TripStarMobilePreviewComponent],
  templateUrl: './trip-star-details.component.html',
  styleUrl: './trip-star-details.component.scss'
})
export class TripStarDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(TripStarService);
  private readonly config = inject(ConfigureService);
  readonly translate = inject(TranslateService);
  readonly typeKeys: Record<TripStarEntityType, string> = {
    [TripStarEntityType.Trip]: 'TripStar.trip',
    [TripStarEntityType.Outing]: 'TripStar.outing',
    [TripStarEntityType.Room]: 'TripStar.room',
    [TripStarEntityType.HajjUmrah]: 'TripStar.hajj'
  };
  card: TripStarDto | null = null;
  items: SelectedTripStarItem[] = [];
  id = 0;
  loading = true;
  error: string | null = null;

  get canEdit(): boolean { return this.config.userPermissions().includes(Permissions.ADEdit); }
  get isArabic(): boolean { return this.translate.currentLang?.startsWith('ar') ?? false; }
  get localExpiry(): Date | null { return parseLocalDate(this.card?.expiryDate ?? null); }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id < 1) { this.error = this.translate.instant('TripStar.invalidCard'); this.loading = false; return; }
    this.id = id;
    this.load(id);
  }

  load(id: number): void {
    this.loading = true;
    this.error = null;
    this.service.get(id).subscribe({
      next: (response) => {
        this.loading = false;
        if (!response.success || !response.data) { this.error = response.message || this.translate.instant('TripStar.loadFailed'); return; }
        this.card = response.data;
        this.items = response.data.items.map(selectedFromDto);
      },
      error: (error) => { this.loading = false; this.error = error.status === 404 ? this.translate.instant('TripStar.notFound') : tripStarError(error); }
    });
  }

  title(card: TripStarDto): string { return (this.isArabic ? card.titleAr || card.title : card.title || card.titleAr) || `#${card.id}`; }
  itemName(item: SelectedTripStarItem): string { return (this.isArabic ? item.entity?.nameAr || item.entity?.name : item.entity?.name || item.entity?.nameAr) || item.title || `#${item.entityId}`; }
  image(path: string | null): string | null { return tripStarImageUrl(path); }
  warning(item: SelectedTripStarItem): string | null {
    const warning = tripStarItemWarning(item.type, item.entity);
    return warning ? `TripStar.${warning === 'inactive' ? 'inactiveItem' : warning}` : null;
  }
  status(card: TripStarDto): string { return `TripStar.${tripStarStatus(card)}`; }
  statusKey(card: TripStarDto): string { return tripStarStatus(card); }
  back(): void { this.router.navigate(['/trip-stars']); }
  retry(): void { if (this.id > 0) this.load(this.id); }
  edit(): void { if (this.card && this.canEdit) this.router.navigate(['/trip-stars', this.card.id, 'edit']); }
}
