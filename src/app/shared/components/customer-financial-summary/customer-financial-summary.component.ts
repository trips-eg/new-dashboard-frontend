import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import arabicLocale from '@angular/common/locales/ar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BookingFinancialsDto } from '../../model/booking-financials.model';

registerLocaleData(arabicLocale, 'ar-EG');

interface FinancialMetric {
  key: keyof BookingFinancialsDto;
  icon: string;
}

@Component({
  selector: 'app-customer-financial-summary',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './customer-financial-summary.component.html',
  styleUrl: './customer-financial-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerFinancialSummaryComponent {
  @Input() financials: BookingFinancialsDto | null | undefined;
  @Input() loading = false;
  @Input() error = '';
  @Input() compact = false;
  @Input() period: { from: string; to: string } | null = null;

  readonly highlights: FinancialMetric[] = [
    { key: 'tripsCommissionNet', icon: 'pi pi-chart-line' },
    { key: 'totalPaidByCustomers', icon: 'pi pi-credit-card' },
    { key: 'vendorPendingSettlement', icon: 'pi pi-clock' }
  ];
  readonly breakdown: FinancialMetric[] = [
    { key: 'tripsCommissionTotal', icon: 'pi pi-percentage' },
    { key: 'couponDeduction', icon: 'pi pi-ticket' },
    { key: 'bonusDeduction', icon: 'pi pi-gift' }
  ];

  constructor(private translate: TranslateService) {}

  get locale(): string {
    return this.translate.currentLang === 'ar' ? 'ar-EG' : 'en-US';
  }

  amount(key: keyof BookingFinancialsDto): number | null {
    const value = this.financials?.[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  get isNegativeNet(): boolean {
    return (this.amount('tripsCommissionNet') ?? 0) < 0;
  }
}
