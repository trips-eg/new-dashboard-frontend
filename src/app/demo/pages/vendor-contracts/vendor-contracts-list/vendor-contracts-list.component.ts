import { VendorContractsService } from './../../../../shared/services/vendor-contracts.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-vendor-contracts-list',
  standalone: true,
  imports: [SharedModule],
  providers: [ConfirmationService],
  templateUrl: './vendor-contracts-list.component.html',
  styleUrl: './vendor-contracts-list.component.scss'
})
export class VendorContractsListComponent implements OnInit {
  loading = false;
  VendorContracts: any[] = [];
  totalRecords: number = 0;
  filterMap: FilterMap = {
    pageIndex: 1,
    pageSize: 10,
    sort: '',
    Search: ''
  };
 vendorStatuses = [
    { value: 1, nameEn: 'New Vendor', nameAr: 'جديد' },
    { value: 2, nameEn: 'Active', nameAr: 'نشط' },
    { value: 3, nameEn: 'Inactive', nameAr: 'غير نشط' },
    { value: 4, nameEn: 'Suspended', nameAr: 'موقوف' }
  ];
  getStatusName(value: number): string {
  const status = this.vendorStatuses.find(s => s.value === value);
  if (!status) return 'Unknown';

  // لو بتستخدم ngx-translate أو language service
  return this.translate.currentLang === 'ar' ? status.nameAr : status.nameEn;
}
  loadVendorContractsList(): void {
    this.loading = true;
    this.VendorContractsService.getVendorContracts(this.filterMap).subscribe({
      next: (res: any) => {
        console.log('vendors contracts...........', res);
        this.VendorContracts = res.data.data || [];
        this.totalRecords = res.data.itemsCount || 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  onSearch(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...this.filterMap,
        pageIndex: 1, // نرجع لأول صفحة لما نعمل بحث جديد
        Search: this.filterMap.Search
      },
      queryParamsHandling: 'merge'
    });
  }

  // ✅ الـ Pagination
  onPageChange(event: any): void {
    const pageIndex = event.first / event.rows + 1;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...this.filterMap,
        pageIndex,
        pageSize: event.rows
      },
      queryParamsHandling: 'merge'
    });
  }
  onDelete(id){}
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.filterMap.pageIndex = +params['pageIndex'] || 1;
      this.filterMap.pageSize = +params['pageSize'] || 10;
      this.filterMap.Search = params['Search'] || '';
      this.filterMap.sort = params['sort'] || '';

      this.loadVendorContractsList();
    });
  }
  constructor(
    private VendorContractsService: VendorContractsService,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService,
    private ConfirmationService: ConfirmationService ,
    private translate:TranslateService
  ) {}
}
