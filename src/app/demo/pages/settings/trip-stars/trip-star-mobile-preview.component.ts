import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectedTripStarItem, TripStarEntityType } from 'src/app/shared/model/trip-star.model';
import { tripStarImageUrl, tripStarItemWarning } from 'src/app/shared/utils/trip-star.utils';

@Component({
  selector: 'app-trip-star-mobile-preview',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './trip-star-mobile-preview.component.html',
  styleUrl: './trip-star-mobile-preview.component.scss'
})
export class TripStarMobilePreviewComponent {
  private readonly translate = inject(TranslateService);
  readonly titleEn = input<string | null>('');
  readonly titleAr = input<string | null>('');
  readonly descriptionEn = input<string | null>('');
  readonly descriptionAr = input<string | null>('');
  readonly image = input<string | null>(null);
  readonly linkUrl = input<string | null>(null);
  readonly expiryDate = input<Date | null>(null);
  readonly items = input<SelectedTripStarItem[]>([]);
  readonly language = signal<'en' | 'ar'>(this.translate.currentLang?.startsWith('ar') ? 'ar' : 'en');
  readonly activeIndex = signal(0);
  readonly artworkRatio = signal(4 / 5);
  readonly visibleIndex = computed(() => Math.min(this.activeIndex(), Math.max(0, this.items().length - 1)));
  readonly activeItem = computed(() => this.items()[this.visibleIndex()] || null);
  readonly collectionTitle = computed(() => (this.language() === 'ar' ? this.titleAr() || this.titleEn() : this.titleEn() || this.titleAr())?.trim() || '');
  readonly collectionDescription = computed(() => (this.language() === 'ar' ? this.descriptionAr() || this.descriptionEn() : this.descriptionEn() || this.descriptionAr())?.trim() || '');
  readonly previewTitle = computed(() => {
    const item = this.activeItem();
    return item ? this.itemName(item) : this.collectionTitle() || (this.language() === 'ar' ? 'تجربتك المميزة' : 'Your featured experience');
  });
  readonly previewDescription = computed(() => {
    const item = this.activeItem();
    if (!item) return this.collectionDescription() || (this.language() === 'ar' ? 'أضف وصفًا لترى كيف ستظهر رسالتك.' : 'Add a description to see how your story will appear.');
    const entity = item.entity;
    const description = this.language() === 'ar' ? entity?.descriptionAr || entity?.description : entity?.description || entity?.descriptionAr;
    return this.plainText(description || entity?.descriptions?.find((entry) => entry.description)?.description || '') || this.itemLocation(item);
  });
  readonly brand = computed(() => this.language() === 'ar' ? 'نجوم الرحلات' : 'TripStar');
  readonly featured = computed(() => this.language() === 'ar' ? 'مميز' : 'Featured');
  readonly explore = computed(() => this.language() === 'ar' ? 'اكتشف الآن' : 'Explore now');
  readonly imagePlaceholder = computed(() => this.language() === 'ar' ? 'أضف صورة لإكمال البطاقة' : 'Add an image to complete the card');
  readonly visual = computed(() => {
    const item = this.activeItem();
    if (!item) return this.image();
    const images = item.entity?.images || [];
    const preferred = images.find((image) => typeof image !== 'string' && image?.isFavoriteImage) || images[0];
    const path = item.imageUrl || item.entity?.imageUrl || (typeof preferred === 'string' ? preferred : preferred?.imageUrl);
    return tripStarImageUrl(path);
  });
  readonly slideDate = computed(() => this.activeItem() ? this.activeItem()?.entity?.startDate || null : this.expiryDate());
  readonly typeKeys: Record<TripStarEntityType, string> = {
    [TripStarEntityType.Trip]: 'TripStar.trip',
    [TripStarEntityType.Outing]: 'TripStar.outing',
    [TripStarEntityType.Room]: 'TripStar.room',
    [TripStarEntityType.HajjUmrah]: 'TripStar.hajj'
  };

  setLanguage(language: 'en' | 'ar'): void { this.language.set(language); }
  onArtworkLoad(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (image.naturalWidth > 0 && image.naturalHeight > 0) this.artworkRatio.set(image.naturalWidth / image.naturalHeight);
  }
  selectItem(index: number): void { if (index >= 0 && index < this.items().length) this.activeIndex.set(index); }
  step(delta: number): void {
    const length = this.items().length;
    if (length > 1) this.activeIndex.set((this.visibleIndex() + delta + length) % length);
  }
  itemName(item: SelectedTripStarItem): string {
    const entity = item.entity;
    return (this.language() === 'ar' ? entity?.nameAr || entity?.name : entity?.name || entity?.nameAr) || item.title || `#${item.entityId}`;
  }
  itemWarning(item: SelectedTripStarItem): string | null {
    const warning = tripStarItemWarning(item.type, item.entity);
    return warning ? `TripStar.${warning === 'inactive' ? 'inactiveItem' : warning}` : null;
  }

  itemLocation(item: SelectedTripStarItem): string {
    const entity = item.entity;
    if (!entity) return '';
    if (item.type === TripStarEntityType.Room) {
      const hotel = entity.hotel;
      return typeof hotel === 'string' ? hotel : (this.language() === 'ar' ? hotel?.nameAr || hotel?.name : hotel?.name || hotel?.nameAr) || '';
    }
    return entity.location || [entity.fromLocation, entity.toLocation].filter(Boolean).join(' — ');
  }

  private plainText(value: string): string {
    return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim();
  }
}
