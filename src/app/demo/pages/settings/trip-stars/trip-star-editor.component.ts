import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable } from 'rxjs';
import { CatalogEntity, SelectedTripStarItem, TripStarEntityType, TripStarFormValue } from 'src/app/shared/model/trip-star.model';
import { HajjUmmrahService } from 'src/app/shared/services/hajj-ummrah.service';
import { OutingService } from 'src/app/shared/services/outing.service';
import { RoomService } from 'src/app/shared/services/room.service';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { TripStarService } from 'src/app/shared/services/trip-star.service';
import {
  buildTripStarFormData, parseLocalDate, selectedFromDto, tripStarError, tripStarImageUrl, tripStarItemWarning
} from 'src/app/shared/utils/trip-star.utils';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TripStarMobilePreviewComponent } from './trip-star-mobile-preview.component';

@Component({
  selector: 'app-trip-star-editor',
  standalone: true,
  imports: [SharedModule, DragDropModule, TripStarMobilePreviewComponent],
  templateUrl: './trip-star-editor.component.html',
  styleUrl: './trip-star-editor.component.scss'
})
export class TripStarEditorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TripStarService);
  private readonly trips = inject(TravelTripsService);
  private readonly outings = inject(OutingService);
  private readonly rooms = inject(RoomService);
  private readonly hajj = inject(HajjUmmrahService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastrService);
  readonly translate = inject(TranslateService);
  readonly types = TripStarEntityType;

  readonly form = this.fb.nonNullable.group({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    linkUrl: '',
    displayOrder: 0,
    expiryDate: new FormControl<Date | null>(null)
  });
  readonly tabTypes = [TripStarEntityType.Trip, TripStarEntityType.Outing, TripStarEntityType.Room, TripStarEntityType.HajjUmrah];
  readonly typeKeys: Record<TripStarEntityType, string> = {
    [TripStarEntityType.Trip]: 'TripStar.trip',
    [TripStarEntityType.Outing]: 'TripStar.outing',
    [TripStarEntityType.Room]: 'TripStar.room',
    [TripStarEntityType.HajjUmrah]: 'TripStar.hajj'
  };

  private catalogSequence = 0;
  id: number | null = null;
  loading = false;
  saving = false;
  catalogLoading = false;
  catalogError: string | null = null;
  selectedItems: SelectedTripStarItem[] = [];
  catalog: CatalogEntity[] = [];
  catalogTotal = 0;
  catalogPage = 1;
  catalogSearch = '';
  activeType = TripStarEntityType.Trip;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  oldImage: string | null = null;

  get isEdit(): boolean { return this.id !== null; }
  get isArabic(): boolean { return this.translate.currentLang?.startsWith('ar') ?? false; }
  get hasMoreCatalog(): boolean { return this.catalogPage * 20 < this.catalogTotal; }

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    if (rawId !== null) {
      const id = Number(rawId);
      if (!Number.isInteger(id) || id < 1) { this.router.navigate(['/trip-stars']); return; }
      this.id = id;
      this.loadCard(id);
    }
    this.loadCatalog();
  }

  private loadCard(id: number): void {
    this.loading = true;
    this.service.get(id).subscribe({
      next: (response) => {
        this.loading = false;
        if (!response.success || !response.data) { this.toast.error(response.message || 'Something went wrong'); this.router.navigate(['/trip-stars']); return; }
        const card = response.data;
        this.form.setValue({
          title: card.title || '',
          titleAr: card.titleAr || '',
          description: card.description || '',
          descriptionAr: card.descriptionAr || '',
          linkUrl: card.linkUrl || '',
          displayOrder: card.displayOrder,
          expiryDate: parseLocalDate(card.expiryDate)
        });
        this.oldImage = tripStarImageUrl(card.imageUrl);
        this.selectedItems = card.items.map(selectedFromDto);
      },
      error: (error) => {
        this.loading = false;
        this.toast.error(tripStarError(error));
        if (error.status === 404) this.router.navigate(['/trip-stars']);
      }
    });
  }

  itemName(item: SelectedTripStarItem): string {
    return (this.isArabic ? item.entity?.nameAr || item.entity?.name : item.entity?.name || item.entity?.nameAr) || item.title || `#${item.entityId}`;
  }

  catalogName(item: CatalogEntity): string {
    return (this.isArabic ? item.nameAr || item.name : item.name || item.nameAr) || item.title || `#${item.id}`;
  }

  image(path: string | null): string | null { return tripStarImageUrl(path); }

  catalogImagePath(item: CatalogEntity): string | null {
    if (item.imageUrl) return item.imageUrl;
    const images = Array.isArray(item.images) ? item.images : [];
    const preferred = images.find((image) => image !== null && typeof image !== 'string' && image.isFavoriteImage) || images[0];
    return typeof preferred === 'string' ? preferred : preferred?.imageUrl || null;
  }

  catalogImage(item: CatalogEntity): string | null { return this.image(this.catalogImagePath(item)); }

  catalogPlace(item: CatalogEntity): string | null {
    switch (this.activeType) {
      case TripStarEntityType.Trip:
      case TripStarEntityType.HajjUmrah:
        return [item.fromLocation, item.toLocation].filter(Boolean).join(' — ') || null;
      case TripStarEntityType.Outing: return item.location || null;
      case TripStarEntityType.Room: return this.relatedName(item.hotel);
    }
  }

  catalogCategory(item: CatalogEntity): string | null {
    switch (this.activeType) {
      case TripStarEntityType.Outing: return item.outingCategoryName || null;
      case TripStarEntityType.Room: return this.relatedName(item.roomType);
      default: return null;
    }
  }

  catalogTypeKey(item: CatalogEntity): string {
    if (this.activeType === TripStarEntityType.HajjUmrah) {
      if (item.type === 1) return 'TripStar.hajjOnly';
      if (item.type === 2) return 'TripStar.umrahOnly';
    }
    return this.typeKeys[this.activeType];
  }

  private relatedName(value: CatalogEntity['hotel']): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value;
    return (this.isArabic ? value.nameAr || value.name : value.name || value.nameAr) || null;
  }
  warning(item: SelectedTripStarItem): string | null {
    const warning = tripStarItemWarning(item.type, item.entity);
    return warning ? `TripStar.${warning === 'inactive' ? 'inactiveItem' : warning}` : null;
  }
  isSelected(item: CatalogEntity): boolean {
    return this.selectedItems.some((selected) => selected.type === this.activeType && selected.entityId === item.id);
  }

  catalogWarning(item: CatalogEntity): string | null {
    const warning = tripStarItemWarning(this.activeType, item);
    return warning ? `TripStar.${warning === 'inactive' ? 'inactiveItem' : warning}` : null;
  }

  typeIcon(type: TripStarEntityType): string {
    switch (type) {
      case TripStarEntityType.Trip: return 'pi pi-map-marker';
      case TripStarEntityType.Outing: return 'pi pi-sun';
      case TripStarEntityType.Room: return 'pi pi-building';
      case TripStarEntityType.HajjUmrah: return 'pi pi-star';
    }
  }

  selectType(type: TripStarEntityType): void {
    if (this.activeType === type) return;
    this.activeType = type;
    this.catalogSearch = '';
    this.catalogPage = 1;
    this.loadCatalog();
  }

  onTabArrow(event: Event, delta: number): void {
    event.preventDefault();
    const direction = this.isArabic ? -delta : delta;
    const next = (this.tabTypes.indexOf(this.activeType) + direction + this.tabTypes.length) % this.tabTypes.length;
    this.selectType(this.tabTypes[next]);
    const tabs = (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[next]?.focus();
  }

  onCatalogSearch(): void { this.catalogPage = 1; this.loadCatalog(); }
  nextCatalogPage(delta: number): void {
    const next = this.catalogPage + delta;
    if (next < 1 || (delta > 0 && !this.hasMoreCatalog)) return;
    this.catalogPage = next;
    this.loadCatalog();
  }

  private catalogRequest(type: TripStarEntityType, pageIndex: number): Observable<any> {
    const criteria = { isPagingEnabled: true, pageIndex, pageSize: 20, search: this.catalogSearch.trim() };
    switch (type) {
      case TripStarEntityType.Trip: return this.trips.getAllTravels(criteria);
      case TripStarEntityType.Outing: return this.outings.getAllOutings(criteria);
      case TripStarEntityType.Room: return this.rooms.getAllRooms(criteria);
      case TripStarEntityType.HajjUmrah:
        return forkJoin([
          this.hajj.getAllManasik({ isPagingEnabled: false, search: criteria.search, Type: 1 }),
          this.hajj.getAllManasik({ isPagingEnabled: false, search: criteria.search, Type: 2 })
        ]);
    }
  }

  loadCatalog(): void {
    const sequence = ++this.catalogSequence;
    this.catalogLoading = true;
    this.catalogError = null;
    const requestedType = this.activeType;
    const requestedPage = this.catalogPage;
    this.catalogRequest(requestedType, requestedPage).subscribe({
      next: (result) => {
        if (sequence !== this.catalogSequence || requestedType !== this.activeType || requestedPage !== this.catalogPage) return;
        this.catalogLoading = false;
        if (Array.isArray(result)) {
          const packages: CatalogEntity[] = result.flatMap((response: any) => response?.data?.data || []);
          this.catalogTotal = packages.length;
          this.catalog = packages.slice((this.catalogPage - 1) * 20, this.catalogPage * 20);
        } else {
          this.catalog = result?.data?.data || [];
          this.catalogTotal = result?.data?.itemsCount || 0;
        }
      },
      error: (error) => {
        if (sequence !== this.catalogSequence) return;
        this.catalogLoading = false;
        this.catalog = [];
        this.catalogTotal = 0;
        this.catalogError = tripStarError(error);
        this.toast.error(this.catalogError);
      }
    });
  }

  addItem(entity: CatalogEntity): void {
    if (this.isSelected(entity)) return;
    this.selectedItems = [...this.selectedItems, {
      type: this.activeType,
      entityId: entity.id,
      title: this.catalogName(entity),
      imageUrl: this.catalogImagePath(entity),
      entity
    }];
  }

  removeItem(index: number): void { this.selectedItems = this.selectedItems.filter((_, i) => i !== index); }
  dropItems(event: CdkDragDrop<SelectedTripStarItem[]>): void {
    const items = [...this.selectedItems];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.selectedItems = items;
  }
  moveItem(index: number, delta: number): void {
    const next = index + delta;
    if (next >= 0 && next < this.selectedItems.length) {
      const items = [...this.selectedItems];
      moveItemInArray(items, index, next);
      this.selectedItems = items;
    }
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (this.imagePreview) URL.revokeObjectURL(this.imagePreview);
    this.imageFile = file;
    this.imagePreview = file ? URL.createObjectURL(file) : null;
  }

  save(): void {
    if (this.saving || this.loading) return;
    const value = this.form.getRawValue() as TripStarFormValue;
    const formData = buildTripStarFormData(value, this.selectedItems, this.imageFile);
    this.saving = true;
    const request = this.id === null ? this.service.create(formData) : this.service.replace(this.id, formData);
    request.subscribe({
      next: (response) => {
        this.saving = false;
        if (!response.success) { this.toast.error(response.message || 'Something went wrong'); return; }
        this.toast.success(response.message || this.translate.instant('TripStar.saved'));
        this.router.navigate(['/trip-stars']);
      },
      error: (error) => { this.saving = false; this.toast.error(tripStarError(error)); }
    });
  }

  cancel(): void { this.router.navigate(['/trip-stars']); }
  ngOnDestroy(): void { if (this.imagePreview) URL.revokeObjectURL(this.imagePreview); }
}
