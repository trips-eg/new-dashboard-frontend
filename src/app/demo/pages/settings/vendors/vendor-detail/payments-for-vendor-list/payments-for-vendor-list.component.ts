import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CompaniesWalletService } from 'src/app/shared/services/companies-wallet.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-payments-for-vendor-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './payments-for-vendor-list.component.html',
  styleUrl: './payments-for-vendor-list.component.scss'
})
export class PaymentsForVendorListComponent implements OnInit, OnChanges {
  @Input() vendorId!: number;   // خليها number علشان تبقى واضحة
  archivedPayment: any[] = [];
  totalRecords: number = 0;     // مهم للـ p-table
  first: number = 0;
  rows: number = 10;
  search: string = '';

  constructor(private companiesWalletService: CompaniesWalletService) {}

  ngOnInit(): void {
    // مش هننده هنا غير لما vendorId يوصل
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vendorId'] && this.vendorId) {
      this.first = 0; // reset paging لما vendor يتغير
      this.getPaymentsForVendor();
    }
  }

  onPageChange(event: any) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? this.rows;
    this.getPaymentsForVendor();
  }

  getPaymentsForVendor() {
    if (!this.vendorId) return;

    const filter = {
      pageIndex: Math.floor(this.first / this.rows) + 1, // 1-based
      pageSize: this.rows,
      search: this.search,
      CompanyId: this.vendorId
    };

    this.companiesWalletService.getCompanyWallet(filter).subscribe({
      next: (res) => {
        console.log('Payments:', res.data);
        this.archivedPayment = res.data.data || res.data; // حسب الريسبونس
        this.totalRecords = res.data.itemsCount || 0;      // علشان الباجيناشن
      },
      error: (err) => {
        console.error('Error loading payments:', err);
      }
    });
  }
}
