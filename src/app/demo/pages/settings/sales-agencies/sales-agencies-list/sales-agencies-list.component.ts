import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { SalesAganciesService } from 'src/app/shared/services/sales-agancies.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sales-agencies-list',
  standalone: true,
  imports: [SharedModule],
  providers: [ConfirmationService],

  templateUrl: './sales-agencies-list.component.html',
  styleUrls: ['./sales-agencies-list.component.scss']
})
export class SalesAgenciesListComponent implements OnInit {
  salesAgencies: any[] = []; // هنا بنخزن الداتا الراجعة من الـ API
  totalRecords = 0; // بنستخدمها في الـ paginator
  loading = false; // للـ spinner
  baseUrl = environment.imgUrl

  // هنا بنحتفظ بالفلترة الحالية (Single Source of Truth)
  filterMap: FilterMap = {
    pageIndex: 1,
    pageSize: 10,
    sort: '',
    Search: ''
  };
getLogoUrl(agency: any): string {
  return agency.logoUrl 
    ? this.baseUrl + agency.logoUrl 
    : 'https://placehold.co/600x400?text=No+Image';
}
  constructor(
    private salesAganciesService: SalesAganciesService,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService , 
    private ConfirmationService:ConfirmationService
  ) {}

  ngOnInit(): void {
    // ✅ بنقرأ الـ query params من الـ URL عشان نقدر نحتفظ بالـ state
    this.route.queryParams.subscribe((params) => {
      this.filterMap.pageIndex = +params['pageIndex'] || 1;
      this.filterMap.pageSize = +params['pageSize'] || 10;
      this.filterMap.Search = params['Search'] || '';
      this.filterMap.sort = params['sort'] || '';

      this.loadSalesAgancies();
    });
  }

  // ✅ ميثود عامة للـ API call
  loadSalesAgancies(): void {
    this.loading = true;
    this.salesAganciesService.getSalesAgancies(this.filterMap).subscribe({
      next: (res: any) => {
        this.salesAgencies = res.data.data || [];
        this.totalRecords = res.data.itemsCount || 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ✅ البحث
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
  onDelete(id) {
    this.ConfirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        this.salesAganciesService.deleteSalesAgancy(id).subscribe({
          next: (res) => {
            this.toastrService.success('deleted sussesfuly', 'deleted');
            this.loadSalesAgancies();
          }
        });
      },
      reject: () => {}
    });
  }
}
