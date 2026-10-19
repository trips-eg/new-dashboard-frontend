import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TagModule } from 'primeng/tag';
import { CountdownTimerComponent } from '../countdown-timer/countdown-timer.component';
import { IAdminCustomTripRequest, IAdminVendorOffer } from 'src/app/shared/model/icustom-trip';
import {
  CustomTripRequestStatus,
  CustomTripTypeLabels,
  CustomTripRequestStatusLabels,
  CustomTripRequestStatusSeverity,
  VendorTripOfferStatusLabels,
  VendorTripOfferStatusSeverity,
  OfferPaymentTypeLabels,
  enumDisplay,
  enumSeverity
} from 'src/app/shared/Enums/custom-trip';

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [CommonModule, TranslateModule, TagModule, CountdownTimerComponent],
  templateUrl: './request-details.component.html',
  styleUrl: './request-details.component.scss'
})
export class RequestDetailsComponent implements OnChanges {
  @Input({ required: true }) request!: IAdminCustomTripRequest;
  @Output() addOffer = new EventEmitter<Event>();
  private readonly translate = inject(TranslateService);
  lowest: number | null = null;
  average: number | null = null;
  highest: number | null = null;
  expandedNotes = new Set<number>();

  ngOnChanges(): void {
    const prices = (this.request.offers || []).map((offer) => offer.price).filter((price) => Number.isFinite(price));
    this.lowest = prices.length ? Math.min(...prices) : null;
    this.highest = prices.length ? Math.max(...prices) : null;
    this.average = prices.length ? Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length) : null;
  }
  get lang(): string {
    return this.translate.currentLang || 'en';
  }
  get accepting(): boolean {
    return this.request.status === CustomTripRequestStatus.ReceivingOffers || this.request.isAcceptingOffers;
  }
  get tripType(): string {
    return CustomTripTypeLabels[this.request.tripType]
      ? enumDisplay(CustomTripTypeLabels, this.request.tripType, this.lang)
      : this.request.tripTypeName || String(this.request.tripType);
  }
  get status(): string {
    return CustomTripRequestStatusLabels[this.request.status]
      ? enumDisplay(CustomTripRequestStatusLabels, this.request.status, this.lang)
      : this.request.statusName || String(this.request.status);
  }
  get statusSeverity() {
    return enumSeverity(CustomTripRequestStatusSeverity, this.request.status);
  }
  initials(name?: string): string {
    if (!name?.trim()) return '—';
    const parts = name.trim().split(/\s+/);
    return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
  }
  get whatsappUrl(): string {
    let phone = (this.request.customerPhone || '').replace(/[^0-9]/g, '');
    if (phone.startsWith('00')) phone = phone.slice(2);
    if (phone.startsWith('0') && phone.length === 11) phone = '20' + phone.slice(1);
    else if (!phone.startsWith('20') && phone.length === 10) phone = '20' + phone;
    return 'https://wa.me/' + phone;
  }
  isLowest(offer: IAdminVendorOffer): boolean {
    return this.request.offers?.length > 1 && this.lowest !== null && offer.price === this.lowest;
  }
  paymentLabel(offer: IAdminVendorOffer): string {
    return OfferPaymentTypeLabels[offer.paymentType]
      ? enumDisplay(OfferPaymentTypeLabels, offer.paymentType, this.lang)
      : offer.paymentTypeName || String(offer.paymentType);
  }
  offerStatus(offer: IAdminVendorOffer): string {
    return VendorTripOfferStatusLabels[offer.status]
      ? enumDisplay(VendorTripOfferStatusLabels, offer.status, this.lang)
      : offer.statusName || String(offer.status);
  }
  offerSeverity(offer: IAdminVendorOffer) {
    return enumSeverity(VendorTripOfferStatusSeverity, offer.status);
  }
  trackOffer(_: number, offer: IAdminVendorOffer): number {
    return offer.id;
  }
  toggleNotes(offer: IAdminVendorOffer): void {
    if (this.expandedNotes.has(offer.id)) this.expandedNotes.delete(offer.id);
    else this.expandedNotes.add(offer.id);
  }
}
